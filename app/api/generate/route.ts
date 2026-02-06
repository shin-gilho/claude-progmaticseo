import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateWithClaude, buildPromptWithKeyword } from '@/lib/api/claude';
import { generateWithGemini } from '@/lib/api/gemini';
import { createPost as createWPPost } from '@/lib/api/wordpress';
import { parseAIResponse } from '@/lib/template-engine/parser';
import { renderTemplate } from '@/lib/template-engine/renderer';
import { extractVariables } from '@/lib/template-engine/variable-extractor';
import { processBatch, createBatchItems, DEFAULT_BATCH_CONFIG } from '@/lib/batch/processor';

interface GenerateRequest {
  templateId: string;
  promptId?: string;
  customPrompt?: string;
  aiModel: 'claude' | 'gemini';
  keywords: string[];
  publishToWp: boolean;
  wpCategory?: number;
  wpTags?: number[];
}

// POST /api/generate - 콘텐츠 생성 시작
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const {
      templateId,
      promptId,
      customPrompt,
      aiModel,
      keywords,
      publishToWp,
      wpCategory,
      wpTags,
    } = body;

    // Validation
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

    // Fetch prompt (if using saved prompt)
    let promptContent = customPrompt || '';
    let prompt = null;
    if (promptId) {
      prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
      }
      promptContent = prompt.content;
    }

    // Fetch settings for API keys
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: 'Settings not configured' }, { status: 400 });
    }

    const apiKey = aiModel === 'claude' ? settings.claudeApiKey : settings.geminiApiKey;
    if (!apiKey) {
      return NextResponse.json({ error: `${aiModel} API key not configured` }, { status: 400 });
    }

    // Get template variables
    const templateVariables = extractVariables(template.htmlContent);

    // Create batch items
    const batchItems = createBatchItems(keywords, (k) => k);

    // Process results
    const results: Array<{
      keyword: string;
      status: 'success' | 'failed';
      postId?: string;
      wpPostId?: number;
      wpUrl?: string;
      error?: string;
    }> = [];

    // Process each keyword
    const batchConfig = {
      ...DEFAULT_BATCH_CONFIG,
      batchSize: settings.batchSize,
    };

    const processedItems = await processBatch(
      batchItems,
      async (keyword: string) => {
        // Build prompt with keyword
        const fullPrompt = buildPromptWithKeyword(promptContent, keyword);

        // Call AI API with selected model
        let aiResponse: string;
        if (aiModel === 'claude') {
          aiResponse = await generateWithClaude(fullPrompt, apiKey, {
            model: settings.claudeModel || 'claude-3-5-sonnet-20241022',
          });
        } else {
          aiResponse = await generateWithGemini(fullPrompt, apiKey, {
            model: settings.geminiModel || 'gemini-1.5-pro',
          });
        }

        // Parse AI response
        const parsedResponse = parseAIResponse(aiResponse);

        // Render template
        const renderedContent = renderTemplate(template.htmlContent, {
          ...parsedResponse,
          keyword,
        });

        // Generate title
        const title = parsedResponse.title || parsedResponse.제목 || `${keyword} - 상세 정보`;

        return {
          title,
          content: renderedContent,
          parsedResponse,
        };
      },
      batchConfig
    );

    // Save results and optionally publish to WordPress
    for (const item of processedItems) {
      const keyword = item.data;

      if (item.status === 'success' && item.result) {
        let wpPostId: number | null = null;
        let wpUrl: string | null = null;

        // Publish to WordPress if enabled
        if (publishToWp) {
          try {
            const wpResult = await createWPPost(
              {
                siteUrl: settings.wpSiteUrl,
                username: settings.wpUsername,
                encryptedPassword: settings.wpPassword,
              },
              {
                title: item.result.title,
                content: item.result.content,
                status: 'draft',
                categories: wpCategory ? [wpCategory] : undefined,
                tags: wpTags,
              }
            );
            wpPostId = wpResult.id;
            wpUrl = wpResult.link;
          } catch (wpError) {
            console.error('WordPress publish error:', wpError);
          }
        }

        // Save to database
        const post = await prisma.post.create({
          data: {
            title: item.result.title,
            content: item.result.content,
            keyword,
            status: 'success',
            wpPostId,
            wpUrl,
            templateId,
            promptId: promptId || null,
          },
        });

        results.push({
          keyword,
          status: 'success',
          postId: post.id,
          wpPostId: wpPostId || undefined,
          wpUrl: wpUrl || undefined,
        });
      } else {
        // Save failed attempt
        const post = await prisma.post.create({
          data: {
            title: `Failed: ${keyword}`,
            content: '',
            keyword,
            status: 'failed',
            errorMessage: item.error,
            templateId,
            promptId: promptId || null,
          },
        });

        results.push({
          keyword,
          status: 'failed',
          postId: post.id,
          error: item.error,
        });
      }
    }

    // Summary
    const summary = {
      total: results.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
    });
  } catch (error) {
    console.error('Error in content generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
