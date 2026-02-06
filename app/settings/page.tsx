'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [wpSiteUrl, setWpSiteUrl] = useState('');
  const [wpUsername, setWpUsername] = useState('');
  const [wpPassword, setWpPassword] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [defaultAiModel, setDefaultAiModel] = useState('claude');
  const [claudeModel, setClaudeModel] = useState('claude-3-5-sonnet-latest');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [batchSize, setBatchSize] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        if (settings) {
          setWpSiteUrl(settings.wpSiteUrl || '');
          setWpUsername(settings.wpUsername || '');
          setDefaultAiModel(settings.defaultAiModel || 'claude');
          setClaudeModel(settings.claudeModel || 'claude-3-5-sonnet-latest');
          setGeminiModel(settings.geminiModel || 'gemini-1.5-flash');
          setBatchSize(settings.batchSize || 5);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wpSiteUrl,
          wpUsername,
          wpPassword: wpPassword || undefined,
          claudeApiKey: claudeApiKey || undefined,
          geminiApiKey: geminiApiKey || undefined,
          defaultAiModel,
          claudeModel,
          geminiModel,
          batchSize,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      alert('설정이 저장되었습니다.');
      fetchSettings();
    } catch (error) {
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/wordpress/connect', {
        method: 'POST',
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: '연결 테스트에 실패했습니다.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">설정</h2>
          <p className="text-muted-foreground">
            WordPress 연동 및 API 키를 설정합니다
          </p>
        </div>

        <div className="max-w-2xl space-y-8">
          {/* WordPress Settings */}
          <Card>
            <CardHeader>
              <CardTitle>WordPress 연동</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">사이트 URL</label>
                <Input
                  type="url"
                  value={wpSiteUrl}
                  onChange={(e) => setWpSiteUrl(e.target.value)}
                  placeholder="https://your-wordpress-site.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">사용자명</label>
                <Input
                  value={wpUsername}
                  onChange={(e) => setWpUsername(e.target.value)}
                  placeholder="WordPress 사용자명"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  애플리케이션 비밀번호
                </label>
                <Input
                  type="password"
                  value={wpPassword}
                  onChange={(e) => setWpPassword(e.target.value)}
                  placeholder="변경하려면 입력하세요"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  WordPress 대시보드 &gt; 사용자 &gt; 프로필 &gt; 애플리케이션
                  비밀번호에서 생성할 수 있습니다.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || !wpSiteUrl || !wpUsername}
                >
                  {isTesting ? '테스트 중...' : '연결 테스트'}
                </Button>
                {testResult && (
                  <div
                    className={`rounded-md border px-4 py-3 text-sm ${
                      testResult.success
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }`}
                  >
                    <div className="font-medium mb-1">
                      {testResult.success ? '✓ 연결 성공' : '✗ 연결 실패'}
                    </div>
                    <div className="text-xs break-words">
                      {testResult.message}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI API 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Claude API Key</label>
                <Input
                  type="password"
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Claude 모델</label>
                <select
                  value={claudeModel}
                  onChange={(e) => setClaudeModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet (권장)</option>
                  <option value="claude-3-5-haiku-latest">Claude 3.5 Haiku (빠름)</option>
                  <option value="claude-3-opus-latest">Claude 3 Opus (고품질)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Gemini API Key</label>
                <Input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Gemini API Key"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Gemini 모델</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (빠름)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (고품질)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">기본 AI 모델</label>
                <select
                  value={defaultAiModel}
                  onChange={(e) => setDefaultAiModel(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2"
                >
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>일반 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="mb-2 block text-sm font-medium">배치 크기</label>
                <Input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  min={1}
                  max={10}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  한 번에 처리할 키워드 개수 (1-10, 기본값: 5)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
