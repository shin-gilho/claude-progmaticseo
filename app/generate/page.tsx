'use client';

import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Sparkles, RefreshCw } from 'lucide-react';
import { PromptSelector } from '@/components/generate/prompt-selector';

interface WPTaxonomy {
  id: number;
  name: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

export default function GeneratePage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiModel, setAiModel] = useState<'claude' | 'gemini'>('claude');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [publishToWp, setPublishToWp] = useState(true);
  const [wpCategories, setWpCategories] = useState<number[]>([]);
  const [wpTags, setWpTags] = useState<number[]>([]);
  const [wpStatus, setWpStatus] = useState<'draft' | 'publish' | 'pending'>('draft');
  const [availableCategories, setAvailableCategories] = useState<WPTaxonomy[]>([]);
  const [availableTags, setAvailableTags] = useState<WPTaxonomy[]>([]);
  const [loadingWpData, setLoadingWpData] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  interface ProgressInfo {
    current: number;
    total: number;
    keyword: string;
    stepLabel: string;
    success: number;
    failed: number;
  }
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch(console.error);
  }, []);

  const fetchWordPressData = async () => {
    setLoadingWpData(true);
    try {
      const [catRes, tagRes] = await Promise.all([
        fetch('/api/wordpress/categories'),
        fetch('/api/wordpress/tags'),
      ]);
      if (catRes.ok) {
        const cats = await catRes.json();
        setAvailableCategories(cats);
      }
      if (tagRes.ok) {
        const tags = await tagRes.json();
        setAvailableTags(tags);
      }
    } catch (error) {
      console.error('Failed to fetch WordPress data:', error);
    } finally {
      setLoadingWpData(false);
    }
  };

  // Auto-load categories/tags when publishToWp is enabled
  useEffect(() => {
    if (publishToWp) {
      fetchWordPressData();
    }
  }, [publishToWp]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/excel/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setKeywords(result.keywords.map((k: any) => k.keyword));
        alert(`${result.validCount}개의 키워드를 불러왔습니다.`);
      } else {
        alert('파일 파싱에 실패했습니다.');
      }
    } catch (error) {
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    if (!selectedTemplateId || !customPrompt.trim() || keywords.length === 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setProgressInfo(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          customPrompt,
          aiModel,
          keywords,
          publishToWp,
          wpCategories,
          wpTags,
          wpStatus,
        }),
      });

      // Validation errors are returned as JSON (non-SSE)
      if (!response.ok) {
        const err = await response.json();
        alert(err.error || '콘텐츠 생성에 실패했습니다.');
        return;
      }

      if (!response.body) {
        alert('스트리밍을 지원하지 않는 환경입니다.');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newline
        const eventBlocks = buffer.split('\n\n');
        buffer = eventBlocks.pop() ?? '';

        for (const block of eventBlocks) {
          const line = block.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'start') {
              setProgressInfo({
                current: 0,
                total: event.total,
                keyword: '',
                stepLabel: '시작 중...',
                success: 0,
                failed: 0,
              });
            } else if (event.type === 'step') {
              setProgressInfo((prev) => ({
                current: prev?.current ?? 0,
                total: event.total,
                keyword: event.keyword,
                stepLabel: event.stepLabel,
                success: prev?.success ?? 0,
                failed: prev?.failed ?? 0,
              }));
            } else if (event.type === 'item_done') {
              const newSuccess = (event.status === 'success' ? 1 : 0);
              const newFailed = (event.status === 'failed' ? 1 : 0);
              setProgressInfo((prev) => ({
                current: event.current,
                total: event.total,
                keyword: event.keyword,
                stepLabel: event.status === 'success' ? '완료' : '실패',
                success: (prev?.success ?? 0) + newSuccess,
                failed: (prev?.failed ?? 0) + newFailed,
              }));
              setProgress(Math.floor((event.current / event.total) * 100));
            } else if (event.type === 'complete') {
              setResults({ success: true, summary: event.summary, results: event.results });
              setProgress(100);
              alert(
                `생성 완료!\n성공: ${event.summary.success}개\n실패: ${event.summary.failed}개`
              );
            } else if (event.type === 'error') {
              alert(`생성 오류: ${event.message}`);
            }
          } catch {
            // Ignore malformed event
          }
        }
      }
    } catch (error) {
      alert('생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const steps = [
    { num: 1, title: '템플릿 선택' },
    { num: 2, title: 'AI 프롬프트' },
    { num: 3, title: '엑셀 업로드' },
    { num: 4, title: 'WordPress 설정' },
    { num: 5, title: '생성 실행' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplateId !== '';
      case 2:
        return customPrompt.trim() !== '';
      case 3:
        return keywords.length > 0;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">콘텐츠 생성</h2>
          <p className="text-muted-foreground">
            단계별로 설정하여 SEO 콘텐츠를 자동 생성합니다
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                    currentStep >= step.num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.num}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    currentStep >= step.num ? 'font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-20 ${
                      currentStep > step.num ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold">Step 1: 템플릿 선택</h3>
                {templates.length === 0 ? (
                  <p className="text-muted-foreground">템플릿을 불러오는 중...</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                          selectedTemplateId === template.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTemplateId(template.id)}
                      >
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description || '설명 없음'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold">Step 2: AI 프롬프트 작성</h3>
                <PromptSelector
                  value={customPrompt}
                  aiModel={aiModel}
                  onChange={setCustomPrompt}
                  onAiModelChange={setAiModel}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold">Step 3: 엑셀 업로드</h3>
                <div
                  {...getRootProps()}
                  className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? '파일을 여기에 놓으세요'
                      : '엑셀 파일을 드래그하거나 클릭하여 업로드하세요'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    지원 형식: .xlsx, .xls, .csv
                  </p>
                </div>
                {fileName && (
                  <div className="mt-4 rounded-lg bg-muted p-4">
                    <div className="font-medium">업로드된 파일: {fileName}</div>
                    <div className="text-sm text-muted-foreground">
                      키워드 {keywords.length}개
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold">Step 4: WordPress 설정</h3>
                <div className="space-y-6">
                  {/* Publish toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="publishToWp"
                      checked={publishToWp}
                      onChange={(e) => setPublishToWp(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="publishToWp" className="text-sm font-medium">
                      WordPress에 자동 발행
                    </label>
                  </div>

                  {publishToWp && (
                    <div className="space-y-6 rounded-lg border p-4">
                      {/* Publish status */}
                      <div>
                        <label className="mb-2 block text-sm font-medium">발행 상태</label>
                        <div className="flex gap-4">
                          {(['draft', 'publish', 'pending'] as const).map((s) => (
                            <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="wpStatus"
                                value={s}
                                checked={wpStatus === s}
                                onChange={() => setWpStatus(s)}
                                className="h-4 w-4"
                              />
                              <span className="text-sm">
                                {s === 'draft' ? '임시저장' : s === 'publish' ? '발행' : '검토 대기'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-sm font-medium">카테고리 선택</label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={fetchWordPressData}
                            disabled={loadingWpData}
                          >
                            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loadingWpData ? 'animate-spin' : ''}`} />
                            새로고침
                          </Button>
                        </div>
                        {loadingWpData ? (
                          <p className="text-sm text-muted-foreground">불러오는 중...</p>
                        ) : availableCategories.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            카테고리가 없거나 WordPress 연결을 확인하세요.
                          </p>
                        ) : (
                          <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 md:grid-cols-2">
                            {availableCategories.map((cat) => (
                              <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={wpCategories.includes(cat.id)}
                                  onChange={(e) => {
                                    setWpCategories((prev) =>
                                      e.target.checked
                                        ? [...prev, cat.id]
                                        : prev.filter((id) => id !== cat.id)
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm">{cat.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="mb-2 block text-sm font-medium">태그 선택</label>
                        {loadingWpData ? (
                          <p className="text-sm text-muted-foreground">불러오는 중...</p>
                        ) : availableTags.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            태그가 없거나 WordPress 연결을 확인하세요.
                          </p>
                        ) : (
                          <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border p-3 md:grid-cols-2">
                            {availableTags.map((tag) => (
                              <label key={tag.id} className="flex cursor-pointer items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={wpTags.includes(tag.id)}
                                  onChange={(e) => {
                                    setWpTags((prev) =>
                                      e.target.checked
                                        ? [...prev, tag.id]
                                        : prev.filter((id) => id !== tag.id)
                                    );
                                  }}
                                  className="h-4 w-4"
                                />
                                <span className="text-sm">{tag.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    WordPress 연결 설정은 설정 페이지에서 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h3 className="mb-6 text-lg font-semibold">Step 5: 생성 실행</h3>
                <div className="space-y-6">
                  <div className="rounded-lg bg-muted p-6">
                    <div className="grid gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">템플릿:</span>
                        <span className="font-medium">
                          {templates.find((t) => t.id === selectedTemplateId)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">AI 모델:</span>
                        <span className="font-medium">{aiModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">키워드 수:</span>
                        <span className="font-medium">{keywords.length}개</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WordPress 발행:</span>
                        <span className="font-medium">
                          {publishToWp ? '예' : '아니오'}
                        </span>
                      </div>
                      {publishToWp && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">발행 상태:</span>
                            <span className="font-medium">
                              {wpStatus === 'draft' ? '임시저장' : wpStatus === 'publish' ? '발행' : '검토 대기'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">카테고리:</span>
                            <span className="font-medium">
                              {wpCategories.length > 0
                                ? wpCategories
                                    .map((id) => availableCategories.find((c) => c.id === id)?.name ?? id)
                                    .join(', ')
                                : '없음'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">태그:</span>
                            <span className="font-medium">
                              {wpTags.length > 0
                                ? wpTags
                                    .map((id) => availableTags.find((t) => t.id === id)?.name ?? id)
                                    .join(', ')
                                : '없음'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={progress} className="mb-1" />
                      {progressInfo ? (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>{progressInfo.current}/{progressInfo.total} 처리 중</span>
                            <span>
                              <span className="text-green-600">성공 {progressInfo.success}개</span>
                              {' | '}
                              <span className="text-red-600">실패 {progressInfo.failed}개</span>
                            </span>
                          </div>
                          {progressInfo.keyword && (
                            <p className="text-xs">
                              현재: {progressInfo.keyword} — {progressInfo.stepLabel}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground">
                          생성 중... {progress}%
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isGenerating ? '생성 중...' : '콘텐츠 생성 시작'}
                  </Button>

                  {results && (
                    <div className="rounded-lg border bg-card p-6">
                      <h4 className="mb-4 font-semibold">생성 결과</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>전체:</span>
                          <span className="font-medium">{results.summary.total}개</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>성공:</span>
                          <span className="font-medium">{results.summary.success}개</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>실패:</span>
                          <span className="font-medium">{results.summary.failed}개</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as Step)}
            disabled={currentStep === 1 || isGenerating}
          >
            이전
          </Button>
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as Step)}
            disabled={currentStep === 5 || !canProceed() || isGenerating}
          >
            다음
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
