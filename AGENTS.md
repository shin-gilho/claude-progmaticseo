# Sub Agents Design Document

## Overview

이 프로젝트는 7개의 전문 Sub Agent로 구성됩니다. 각 Agent는 특정 도메인을 담당하며, 독립적으로 작업을 수행할 수 있습니다.

---

## Agent 1: UI Developer

### Role & Responsibility
UI 컴포넌트와 스타일링을 담당하는 프론트엔드 전문가

### Scope
```
/components/           # 모든 React 컴포넌트
  ├── ui/             # shadcn/ui 기본 컴포넌트
  ├── layout/         # 레이아웃 컴포넌트
  ├── dashboard/      # 대시보드 컴포넌트
  ├── templates/      # 템플릿 관련 컴포넌트
  ├── generate/       # 생성 페이지 컴포넌트
  ├── history/        # 기록 페이지 컴포넌트
  └── settings/       # 설정 페이지 컴포넌트

/app/                 # 페이지 레이아웃 및 UI
  ├── layout.tsx
  ├── page.tsx
  └── [각 페이지]/page.tsx
```

### Guidelines

#### Design System
```css
/* Colors */
Primary: #3B82F6 (Blue)
Secondary: #10B981 (Green)
Danger: #EF4444 (Red)
Background: #F9FAFB
Text: #1F2937

/* Typography */
Font: Inter, Pretendard
Monospace: Fira Code, JetBrains Mono
```

#### Component Standards
```tsx
// 컴포넌트 구조 예시
'use client'; // 필요시에만

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export function Component({ className, children }: ComponentProps) {
  return (
    <div className={cn('base-styles', className)}>
      {children}
    </div>
  );
}
```

#### UI Libraries
- **shadcn/ui**: 기본 UI 컴포넌트 (Button, Card, Dialog 등)
- **Tailwind CSS**: 스타일링
- **Lucide React**: 아이콘
- **react-dropzone**: 파일 업로드

#### Best Practices
1. 컴포넌트는 단일 책임 원칙 준수
2. Props 타입 항상 정의
3. `cn()` 유틸리티로 클래스 조합
4. 반응형은 Desktop-first (1280px+)
5. 로딩/에러/빈 상태 항상 처리

### Tasks Assigned
- [ ] shadcn/ui 설치 및 기본 컴포넌트 설정
- [ ] 레이아웃 컴포넌트 (Header, Sidebar)
- [ ] 대시보드 UI
- [ ] 템플릿 관리 페이지 UI
- [ ] 콘텐츠 생성 페이지 UI (Step-by-step)
- [ ] 기록 페이지 UI (테이블, 필터)
- [ ] 설정 페이지 UI (폼)
- [ ] 진행 상황 모니터 UI (Progress bar, 상태 표시)

---

## Agent 2: API Integrator

### Role & Responsibility
외부 API 연동을 담당하는 백엔드 통합 전문가

### Scope
```
/lib/api/             # API 클라이언트
  ├── claude.ts       # Claude API
  ├── gemini.ts       # Gemini API
  └── wordpress.ts    # WordPress REST API

/app/api/             # API Routes
  ├── ai/
  │   ├── claude/route.ts
  │   └── gemini/route.ts
  ├── wordpress/
  │   ├── connect/route.ts
  │   ├── publish/route.ts
  │   └── categories/route.ts
  └── generate/route.ts
```

### Guidelines

#### Claude API Integration
```typescript
// lib/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateWithClaude(
  prompt: string,
  apiKey: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: options.model || 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens || 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract text content
  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text || '';
}
```

#### Gemini API Integration
```typescript
// lib/api/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

#### WordPress REST API
```typescript
// lib/api/wordpress.ts
export interface WPAuth {
  siteUrl: string;
  username: string;
  password: string;  // Application Password
}

export async function wpRequest<T>(
  auth: WPAuth,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { siteUrl, username, password } = auth;
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  const response = await fetch(`${siteUrl}/wp-json/wp/v2${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `WordPress API error: ${response.status}`);
  }

  return response.json();
}
```

#### Error Handling Pattern
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Rate limit handling
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries || !(error instanceof APIError) || !error.retryable) {
        throw error;
      }
      await delay(baseDelay * Math.pow(2, i)); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Best Practices
1. API 키는 항상 서버 사이드에서만 사용
2. 응답 타입 명시적으로 정의
3. 에러 처리 표준화 (APIError 클래스)
4. Rate limit 대응 (재시도, 지수 백오프)
5. 타임아웃 설정

### Tasks Assigned
- [ ] Claude API 클라이언트 구현
- [ ] Gemini API 클라이언트 구현
- [ ] WordPress REST API 클라이언트 구현
- [ ] 연결 테스트 API 구현
- [ ] 포스트 발행 API 구현
- [ ] 카테고리/태그 조회 API 구현
- [ ] Rate limit 핸들링 구현

---

## Agent 3: DB Architect

### Role & Responsibility
데이터베이스 설계, Prisma 스키마, 쿼리 최적화를 담당

### Scope
```
/prisma/
  ├── schema.prisma   # 데이터베이스 스키마
  └── migrations/     # 마이그레이션 파일

/lib/
  └── db.ts           # Prisma Client singleton
```

### Guidelines

#### Prisma Schema
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Template {
  id          String   @id @default(cuid())
  name        String
  htmlContent String   @db.Text
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  posts       Post[]

  @@index([name])
}

model Prompt {
  id        String   @id @default(cuid())
  name      String
  content   String   @db.Text
  aiModel   String   // "claude" | "gemini"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]

  @@index([aiModel])
}

model Post {
  id           String   @id @default(cuid())
  title        String
  content      String   @db.Text
  keyword      String
  status       String   // "pending" | "success" | "failed"
  wpPostId     Int?
  wpUrl        String?
  errorMessage String?
  templateId   String
  template     Template @relation(fields: [templateId], references: [id])
  promptId     String
  prompt       Prompt   @relation(fields: [promptId], references: [id])
  createdAt    DateTime @default(now())

  @@index([status])
  @@index([createdAt])
  @@index([keyword])
}

model Settings {
  id             String   @id @default(cuid())
  wpSiteUrl      String
  wpUsername     String
  wpPassword     String   // Encrypted
  claudeApiKey   String?  // Encrypted
  geminiApiKey   String?  // Encrypted
  defaultAiModel String   @default("claude")
  batchSize      Int      @default(5)
  updatedAt      DateTime @updatedAt
}
```

#### Prisma Client Singleton
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### Query Patterns
```typescript
// 페이지네이션
const posts = await prisma.post.findMany({
  take: 10,
  skip: (page - 1) * 10,
  orderBy: { createdAt: 'desc' },
  include: { template: true, prompt: true },
});

// 필터링
const failedPosts = await prisma.post.findMany({
  where: { status: 'failed' },
  select: { id: true, keyword: true, errorMessage: true },
});

// 집계
const stats = await prisma.post.groupBy({
  by: ['status'],
  _count: true,
});
```

### Best Practices
1. 인덱스 적절히 설정 (자주 검색되는 필드)
2. `@updatedAt` 자동 타임스탬프 활용
3. 관계는 명시적으로 정의
4. `select`로 필요한 필드만 조회
5. 민감 데이터는 암호화 후 저장

### Tasks Assigned
- [ ] Prisma 스키마 정의
- [ ] 초기 마이그레이션 생성
- [ ] Prisma Client 싱글톤 설정
- [ ] 인덱스 최적화
- [ ] 시드 데이터 (선택)

---

## Agent 4: Template Engine Specialist

### Role & Responsibility
HTML 템플릿 파싱, 변수 치환 로직, AI 응답 매핑을 담당

### Scope
```
/lib/template-engine/
  ├── variable-extractor.ts  # {{변수}} 추출
  ├── parser.ts              # AI 응답 파싱
  └── renderer.ts            # 템플릿 렌더링
```

### Guidelines

#### Variable Syntax
템플릿 변수 형식: `{{변수명}}`

```html
<!-- 예시 템플릿 -->
<article>
  <h1>{{title}}</h1>
  <div class="meta">
    <span>카테고리: {{category}}</span>
  </div>
  <div class="content">
    {{main}}
  </div>
  <div class="symptoms">
    <h2>주요 증상</h2>
    <p>{{symptoms}}</p>
  </div>
</article>
```

#### Variable Extraction
```typescript
// lib/template-engine/variable-extractor.ts

export interface ExtractedVariable {
  name: string;
  positions: number[];  // 템플릿 내 위치들
}

export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1].trim());
  }

  return Array.from(variables);
}

export function validateTemplate(template: string): {
  isValid: boolean;
  variables: string[];
  errors: string[];
} {
  const errors: string[] = [];
  const variables = extractVariables(template);

  // 변수 이름 검증
  for (const v of variables) {
    if (!/^[a-zA-Z가-힣][a-zA-Z0-9가-힣_]*$/.test(v)) {
      errors.push(`Invalid variable name: {{${v}}}`);
    }
  }

  // 닫히지 않은 변수 체크
  const unclosed = template.match(/\{\{[^}]*$/gm);
  if (unclosed) {
    errors.push('Unclosed variable bracket found');
  }

  return {
    isValid: errors.length === 0,
    variables,
    errors,
  };
}
```

#### AI Response Parsing
```typescript
// lib/template-engine/parser.ts

export function parseAIResponse(response: string): Record<string, string> {
  // JSON 코드 블록 추출
  const jsonBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonString = jsonBlockMatch ? jsonBlockMatch[1] : response;

  try {
    const parsed = JSON.parse(jsonString.trim());

    // 모든 값을 문자열로 변환
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        result[key] = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        result[key] = JSON.stringify(value);
      } else {
        result[key] = String(value);
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error}`);
  }
}

export function validateAIResponse(
  response: Record<string, string>,
  requiredVariables: string[]
): { isValid: boolean; missing: string[] } {
  const missing = requiredVariables.filter(v => !(v in response));
  return {
    isValid: missing.length === 0,
    missing,
  };
}
```

#### Template Rendering
```typescript
// lib/template-engine/renderer.ts

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    // 변수명 양쪽 공백 허용
    const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

export function renderTemplateWithFallback(
  template: string,
  variables: Record<string, string>,
  fallback: string = '[N/A]'
): string {
  const allVariables = extractVariables(template);
  const varsWithFallback = { ...variables };

  for (const v of allVariables) {
    if (!(v in varsWithFallback)) {
      varsWithFallback[v] = fallback;
    }
  }

  return renderTemplate(template, varsWithFallback);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

### Best Practices
1. 변수명은 영문, 한글, 숫자, 언더스코어만 허용
2. AI 응답은 항상 JSON 형식으로 요청
3. 누락된 변수는 fallback 처리
4. XSS 방지를 위한 sanitization 고려

### Tasks Assigned
- [ ] 변수 추출기 구현
- [ ] 템플릿 유효성 검사 구현
- [ ] AI 응답 파서 구현
- [ ] 템플릿 렌더러 구현
- [ ] Fallback 처리 로직

---

## Agent 5: Batch Processor

### Role & Responsibility
배치 작업 처리, 진행 상황 추적, 에러 핸들링을 담당

### Scope
```
/lib/batch/
  ├── processor.ts    # 메인 배치 프로세서
  ├── queue.ts        # 작업 큐 관리
  └── retry.ts        # 재시도 로직
```

### Guidelines

#### Batch Configuration
```typescript
export interface BatchConfig {
  batchSize: number;        // 한 번에 처리할 개수 (기본: 5)
  delayBetweenBatches: number;  // 배치 간 딜레이 (ms)
  maxRetries: number;       // 최대 재시도 횟수
  retryDelay: number;       // 재시도 간 딜레이 (ms)
  timeout: number;          // 단일 작업 타임아웃 (ms)
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  batchSize: 5,
  delayBetweenBatches: 2000,
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};
```

#### Batch Processor
```typescript
// lib/batch/processor.ts

export interface BatchItem<T> {
  id: string;
  data: T;
  status: 'pending' | 'processing' | 'success' | 'failed';
  result?: any;
  error?: string;
  retryCount: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  success: number;
  failed: number;
  pending: number;
  currentBatch: number;
  totalBatches: number;
  percentage: number;
  currentItem?: string;
}

export type ProgressCallback = (progress: BatchProgress) => void;
export type ItemProcessor<T, R> = (item: T) => Promise<R>;

export async function processBatch<T, R>(
  items: BatchItem<T>[],
  processor: ItemProcessor<T, R>,
  config: BatchConfig,
  onProgress: ProgressCallback,
  signal?: AbortSignal
): Promise<BatchItem<T>[]> {
  const totalBatches = Math.ceil(items.length / config.batchSize);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    // 중단 확인
    if (signal?.aborted) {
      throw new Error('Batch processing aborted');
    }

    const start = batchIndex * config.batchSize;
    const batch = items.slice(start, start + config.batchSize);

    // 배치 내 병렬 처리
    await Promise.all(
      batch.map(async (item) => {
        item.status = 'processing';

        try {
          item.result = await processWithRetry(
            () => processor(item.data),
            config.maxRetries,
            config.retryDelay
          );
          item.status = 'success';
        } catch (error) {
          item.status = 'failed';
          item.error = error instanceof Error ? error.message : 'Unknown error';
        }
      })
    );

    // 진행 상황 업데이트
    const completed = items.filter(i => i.status !== 'pending').length;
    onProgress({
      total: items.length,
      completed,
      success: items.filter(i => i.status === 'success').length,
      failed: items.filter(i => i.status === 'failed').length,
      pending: items.filter(i => i.status === 'pending').length,
      currentBatch: batchIndex + 1,
      totalBatches,
      percentage: Math.round((completed / items.length) * 100),
    });

    // 다음 배치 전 딜레이 (마지막 배치 제외)
    if (batchIndex < totalBatches - 1) {
      await delay(config.delayBetweenBatches);
    }
  }

  return items;
}
```

#### Retry Logic
```typescript
// lib/batch/retry.ts

export async function processWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 마지막 시도면 에러 throw
      if (attempt === maxRetries) {
        throw lastError;
      }

      // 재시도 가능한 에러인지 확인
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // 지수 백오프
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function isRetryableError(error: Error): boolean {
  // Rate limit, timeout, network 에러는 재시도
  const retryableMessages = [
    'rate limit',
    'timeout',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    '429',
    '503',
  ];

  return retryableMessages.some(msg =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}
```

### Best Practices
1. 배치 크기는 API rate limit 고려 (5개 권장)
2. 배치 간 딜레이로 rate limit 방지
3. 지수 백오프로 재시도
4. 진행 상황 실시간 업데이트
5. 중단(abort) 기능 지원

### Tasks Assigned
- [ ] 배치 프로세서 구현
- [ ] 재시도 로직 구현
- [ ] 진행 상황 추적 구현
- [ ] 일시정지/재개 기능
- [ ] 작업 큐 관리

---

## Agent 6: Security Specialist

### Role & Responsibility
보안, API 키 암호화, WordPress 인증 정보 보호를 담당

### Scope
```
/lib/security/
  ├── encryption.ts   # 암호화/복호화
  └── sanitize.ts     # 입력 정제
```

### Guidelines

#### Encryption (AES-256)
```typescript
// lib/security/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('ENCRYPTION_SECRET_KEY is not defined');
}

export function encrypt(plaintext: string): string {
  return CryptoJS.AES.encrypt(plaintext, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// 안전한 비교 (timing attack 방지)
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
```

#### Input Sanitization
```typescript
// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

// HTML sanitization (XSS 방지)
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'blockquote', 'pre', 'code',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

// URL validation
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// API key format validation
export function isValidClaudeAPIKey(key: string): boolean {
  return /^sk-ant-[a-zA-Z0-9-_]+$/.test(key);
}

export function isValidGeminiAPIKey(key: string): boolean {
  return /^AI[a-zA-Z0-9_-]{30,}$/.test(key);
}
```

#### Environment Variables
```bash
# .env.local (절대 커밋하지 않음)

# Database
DATABASE_URL="postgresql://..."

# Encryption (32자 이상 랜덤 문자열)
ENCRYPTION_SECRET_KEY="your-very-secure-32-char-secret-key"

# 개발용 API 키 (선택)
# CLAUDE_API_KEY="sk-ant-..."
# GEMINI_API_KEY="..."
```

### Security Checklist
- [ ] API 키는 서버 사이드에서만 접근
- [ ] 민감 데이터는 암호화 후 DB 저장
- [ ] 환경 변수로 시크릿 관리
- [ ] .env.local은 .gitignore에 포함
- [ ] 사용자 입력 HTML sanitize
- [ ] XSS, SQL Injection 방지
- [ ] HTTPS 강제 (Vercel 자동)

### Tasks Assigned
- [ ] 암호화/복호화 모듈 구현
- [ ] HTML sanitization 구현
- [ ] API 키 검증 함수 구현
- [ ] 환경 변수 설정 가이드 작성

---

## Agent 7: Excel Parser

### Role & Responsibility
엑셀 파일 업로드, 파싱, 검증을 담당

### Scope
```
/lib/excel/
  ├── parser.ts      # 파일 파싱
  └── validator.ts   # 데이터 검증
```

### Guidelines

#### Excel Parsing
```typescript
// lib/excel/parser.ts
import * as XLSX from 'xlsx';

export interface ParsedRow {
  rowNumber: number;
  keyword: string;
  additionalData?: Record<string, string>;
}

export interface ParseResult {
  success: boolean;
  data: ParsedRow[];
  errors: { row: number; message: string }[];
  totalRows: number;
}

export function parseExcelFile(buffer: ArrayBuffer): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // 헤더 포함 여부 확인
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const hasHeader = isHeaderRow(worksheet, range);

    const startRow = hasHeader ? 1 : 0;
    const data = XLSX.utils.sheet_to_json<any[]>(worksheet, {
      header: 1,
      defval: '',
    });

    const results: ParsedRow[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = startRow; i < data.length; i++) {
      const row = data[i] as any[];
      const rowNumber = i + 1;  // 1-based for user display

      if (!row || row.length === 0) {
        continue;  // 빈 행 스킵
      }

      const keyword = String(row[0] || '').trim();

      if (!keyword) {
        errors.push({ row: rowNumber, message: 'Empty keyword' });
        continue;
      }

      results.push({
        rowNumber,
        keyword,
        additionalData: row.length > 1
          ? { col2: String(row[1] || ''), col3: String(row[2] || '') }
          : undefined,
      });
    }

    return {
      success: errors.length === 0,
      data: results,
      errors,
      totalRows: data.length - startRow,
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [{ row: 0, message: `Parse error: ${error}` }],
      totalRows: 0,
    };
  }
}

function isHeaderRow(worksheet: XLSX.WorkSheet, range: XLSX.Range): boolean {
  const firstCell = worksheet['A1'];
  if (!firstCell) return false;

  const value = String(firstCell.v || '').toLowerCase();
  const headerKeywords = ['keyword', '키워드', 'key', 'word', '검색어'];

  return headerKeywords.some(h => value.includes(h));
}
```

#### Validation
```typescript
// lib/excel/validator.ts

export interface ValidationResult {
  isValid: boolean;
  validRows: ParsedRow[];
  invalidRows: { row: ParsedRow; reason: string }[];
  warnings: string[];
}

export function validateKeywords(rows: ParsedRow[]): ValidationResult {
  const validRows: ParsedRow[] = [];
  const invalidRows: { row: ParsedRow; reason: string }[] = [];
  const warnings: string[] = [];
  const seenKeywords = new Set<string>();

  for (const row of rows) {
    // 길이 검증
    if (row.keyword.length < 2) {
      invalidRows.push({ row, reason: 'Keyword too short (min 2 chars)' });
      continue;
    }

    if (row.keyword.length > 200) {
      invalidRows.push({ row, reason: 'Keyword too long (max 200 chars)' });
      continue;
    }

    // 특수문자 검증
    if (/[<>{}]/.test(row.keyword)) {
      invalidRows.push({ row, reason: 'Invalid characters in keyword' });
      continue;
    }

    // 중복 검사
    if (seenKeywords.has(row.keyword.toLowerCase())) {
      warnings.push(`Duplicate keyword at row ${row.rowNumber}: ${row.keyword}`);
    }
    seenKeywords.add(row.keyword.toLowerCase());

    validRows.push(row);
  }

  return {
    isValid: invalidRows.length === 0,
    validRows,
    invalidRows,
    warnings,
  };
}
```

#### Supported Formats
- `.xlsx` (Excel 2007+)
- `.xls` (Excel 97-2003)
- `.csv` (Comma-separated)

### Best Practices
1. A열 첫 번째 컬럼에서 키워드 읽기
2. 헤더 행 자동 감지
3. 빈 행 스킵
4. 중복 키워드 경고
5. 최대 1000개 제한 권장

### Tasks Assigned
- [ ] SheetJS 설치 및 설정
- [ ] 엑셀 파싱 함수 구현
- [ ] 키워드 검증 함수 구현
- [ ] CSV 지원 추가
- [ ] 파일 크기 제한 구현

---

## Agent Collaboration

### Workflow
```
1. User uploads Excel
   → Excel Parser (Agent 7)

2. Parse AI prompt
   → Template Engine Specialist (Agent 4)

3. Generate content via AI
   → API Integrator (Agent 2)
   → Batch Processor (Agent 5)

4. Render template
   → Template Engine Specialist (Agent 4)

5. Publish to WordPress
   → API Integrator (Agent 2)

6. Update database
   → DB Architect (Agent 3)

7. Display progress
   → UI Developer (Agent 1)

Throughout:
   → Security Specialist (Agent 6)
```

### Communication
각 Agent는 독립적으로 작업하되, 인터페이스를 통해 소통합니다:

- **Types**: `/types/` 폴더의 공유 타입 정의
- **Events**: 진행 상황 콜백 함수
- **Errors**: 표준화된 에러 클래스

---

## Summary Table

| Agent | Files | Dependencies |
|-------|-------|-------------|
| UI Developer | `/components/`, `/app/` pages | shadcn/ui, Tailwind |
| API Integrator | `/lib/api/`, `/app/api/` | Anthropic SDK, Google AI |
| DB Architect | `/prisma/`, `/lib/db.ts` | Prisma |
| Template Engine | `/lib/template-engine/` | - |
| Batch Processor | `/lib/batch/` | - |
| Security | `/lib/security/` | crypto-js, DOMPurify |
| Excel Parser | `/lib/excel/` | SheetJS (xlsx) |
