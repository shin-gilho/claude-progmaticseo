import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateWithClaude, buildPromptWithKeyword } from '@/lib/api/claude';
import { generateWithGemini } from '@/lib/api/gemini';
import { createPost as createWPPost, updatePost as updateWPPost, buildRankMathMetadata } from '@/lib/api/wordpress';
import { parseAIResponse } from '@/lib/template-engine/parser';
import { renderTemplate } from '@/lib/template-engine/renderer';
import { extractVariables } from '@/lib/template-engine/variable-extractor';
import { extractTitle } from '@/lib/template-engine/title-extractor';
import { DEFAULT_BATCH_CONFIG } from '@/lib/batch/processor';
import { formatDiseaseCode } from '@/lib/utils/disease-code';
import { delay } from '@/lib/utils';

interface GenerateRequest {
  templateId: string;
  promptId?: string;
  customPrompt?: string;
  aiModel: 'claude' | 'gemini';
  keywords: string[];
  publishToWp: boolean;
  wpCategories?: number[];
  wpTags?: number[];
  wpStatus?: 'draft' | 'publish' | 'pending';
}

// POST /api/generate - SSE streaming content generation
export async function POST(request: NextRequest) {
  const body: GenerateRequest = await request.json();
  const {
    templateId,
    promptId,
    customPrompt,
    aiModel,
    keywords,
    publishToWp,
    wpCategories,
    wpTags,
    wpStatus,
  } = body;

  // Validation — return JSON errors before starting the stream
  if (!templateId) {
    return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
  }
  if (!promptId && !customPrompt) {
    return NextResponse.json({ error: 'Prompt ID or custom prompt is required' }, { status: 400 });
  }
  if (!keywords || keywords.length === 0) {
    return NextResponse.json({ error: 'Keywords are required' }, { status: 400 });
  }

  // Fetch template
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Fetch prompt
  let promptContent = customPrompt || '';
  if (promptId) {
    const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    promptContent = prompt.content;
  }

  // Fetch settings
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    return NextResponse.json({ error: 'Settings not configured' }, { status: 400 });
  }

  const apiKey = aiModel === 'claude' ? settings.claudeApiKey : settings.geminiApiKey;
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json({
      error: `${aiModel} API key not configured. Please add it in Settings.`,
    }, { status: 400 });
  }

  const requiredVarNames = extractVariables(template.htmlContent);
  const batchSize = settings.batchSize || DEFAULT_BATCH_CONFIG.batchSize;
  const { delayBetweenBatches, maxRetries, retryDelay } = DEFAULT_BATCH_CONFIG;

  const wpAuth = {
    siteUrl: settings.wpSiteUrl,
    username: settings.wpUsername,
    encryptedPassword: settings.wpPassword,
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Stream already closed
        }
      };

      let completedCount = 0;
      let successCount = 0;
      let failedCount = 0;
      const results: Array<{
        keyword: string;
        status: 'success' | 'failed';
        postId?: string;
        wpPostId?: number;
        wpUrl?: string;
        error?: string;
      }> = [];

      try {
        sendEvent({ type: 'start', total: keywords.length });

        for (let i = 0; i < keywords.length; i += batchSize) {
          const batch = keywords.slice(i, i + batchSize);

          await Promise.all(
            batch.map(async (keyword) => {
              sendEvent({
                type: 'step',
                current: completedCount + 1,
                total: keywords.length,
                keyword,
                stepLabel: 'AI 생성 중',
              });

              let success = false;
              let title = '';
              let content = '';
              let wpPostId: number | null = null;
              let wpUrl: string | null = null;
              let errorMessage: string | undefined;

              // Retry loop
              for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                  // AI generation
                  const fullPrompt = buildPromptWithKeyword(promptContent, keyword);
                  let aiResponse: string;
                  if (aiModel === 'claude') {
                    aiResponse = await generateWithClaude(fullPrompt, apiKey, {
                      model: settings.claudeModel || 'claude-sonnet-4-20250514',
                    });
                  } else {
                    aiResponse = await generateWithGemini(fullPrompt, apiKey, {
                      model: settings.geminiModel || 'gemini-2.5-flash',
                    });
                  }

                  const parsedResponse = parseAIResponse(aiResponse);
                  const formatted = formatDiseaseCode(keyword);

                  const filteredResponse: Record<string, string> = {};
                  for (const varName of requiredVarNames) {
                    if (varName in parsedResponse) {
                      filteredResponse[varName] = parsedResponse[varName];
                    }
                  }
                  const templateVariables = {
                    ...filteredResponse,
                    keyword: formatted.original,
                    keyword_normalized: formatted.normalized,
                    keyword_display: formatted.display,
                    disease_code: formatted.original,
                    키워드: formatted.original,
                  };

                  content = renderTemplate(template.htmlContent, templateVariables);
                  const extractedTitle = extractTitle(template.titleTemplate, templateVariables);
                  title =
                    extractedTitle ||
                    parsedResponse.title ||
                    parsedResponse.제목 ||
                    `${keyword} - 상세 정보`;

                  // WordPress publish
                  if (publishToWp) {
                    sendEvent({
                      type: 'step',
                      current: completedCount + 1,
                      total: keywords.length,
                      keyword,
                      stepLabel: '워드프레스 발행 중',
                    });

                    // Step 1: Create post (without meta to avoid WP ignoring it)
                    const wpResult = await createWPPost(wpAuth, {
                      title,
                      content,
                      status: wpStatus || 'draft',
                      categories: wpCategories && wpCategories.length > 0 ? wpCategories : undefined,
                      tags: wpTags && wpTags.length > 0 ? wpTags : undefined,
                    });
                    wpPostId = wpResult.id;
                    wpUrl = wpResult.link;

                    // Step 2: Update RankMath meta separately
                    const rankMathMeta = buildRankMathMetadata(
                      keyword,
                      template.rankMathFocusKeywords,
                      template.rankMathDescription
                    );
                    if (rankMathMeta) {
                      try {
                        await updateWPPost(wpAuth, wpResult.id, {
                          meta: { ...rankMathMeta, rank_math_title: title },
                        });
                      } catch (metaError) {
                        console.error('RankMath meta update failed:', metaError);
                        // Non-fatal: post was created, just meta failed
                      }
                    }
                  }

                  success = true;
                  break; // Exit retry loop on success
                } catch (err) {
                  const isLast = attempt === maxRetries;
                  if (isLast) {
                    errorMessage = err instanceof Error ? err.message : 'Unknown error';
                  } else {
                    await delay(retryDelay * Math.pow(2, attempt));
                  }
                }
              }

              // Save to database
              const postRecord = await prisma.post.create({
                data: {
                  title: success ? title : `Failed: ${keyword}`,
                  content: success ? content : '',
                  keyword,
                  status: success ? 'success' : 'failed',
                  wpPostId,
                  wpUrl,
                  errorMessage: success ? null : errorMessage,
                  templateId,
                  promptId: promptId || null,
                },
              });

              completedCount++;
              if (success) successCount++;
              else failedCount++;

              results.push({
                keyword,
                status: success ? 'success' : 'failed',
                postId: postRecord.id,
                wpPostId: wpPostId || undefined,
                wpUrl: wpUrl || undefined,
                error: errorMessage,
              });

              sendEvent({
                type: 'item_done',
                current: completedCount,
                total: keywords.length,
                keyword,
                status: success ? 'success' : 'failed',
                error: errorMessage,
              });
            })
          );

          // Delay between batches (except the last)
          if (i + batchSize < keywords.length) {
            await delay(delayBetweenBatches);
          }
        }

        sendEvent({
          type: 'complete',
          summary: { total: keywords.length, success: successCount, failed: failedCount },
          results,
        });
      } catch (error) {
        console.error('Error in content generation stream:', error);
        sendEvent({
          type: 'error',
          message: error instanceof Error ? error.message : 'Generation failed',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
