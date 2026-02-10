import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, ArrowLeft } from 'lucide-react';

export default function ApiUsagePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            대시보드
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">API 사용량 확인</h1>
        <p className="text-muted-foreground mt-2">
          각 AI 서비스의 사용량을 확인하고 관리할 수 있습니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Claude API */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">C</span>
              </div>
              Claude API
            </CardTitle>
            <CardDescription>
              Anthropic Claude API 사용량 및 크레딧 확인
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <ExternalLink className="h-4 w-4 mr-2" />
                Claude Console 열기
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              • API 키 관리<br />
              • 사용량 및 비용 확인<br />
              • 요금제 및 크레딧 관리
            </p>
          </CardContent>
        </Card>

        {/* Gemini API */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">G</span>
              </div>
              Gemini API
            </CardTitle>
            <CardDescription>
              Google Gemini API 사용량 및 할당량 확인
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google AI Studio 열기
                </Button>
              </a>
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Cloud Console 열기
                </Button>
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              • API 키 관리<br />
              • 무료 할당량 확인<br />
              • 프로젝트 및 청구 관리
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg max-w-4xl">
        <h3 className="font-semibold mb-2">💡 참고사항</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• API 사용량은 각 서비스의 공식 콘솔에서 실시간으로 확인할 수 있습니다</li>
          <li>• API 키는 설정 페이지에서 관리할 수 있습니다</li>
          <li>• 과도한 API 사용 시 비용이 발생할 수 있으니 주의하세요</li>
          <li>• 무료 할당량을 초과하면 자동으로 과금될 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}
