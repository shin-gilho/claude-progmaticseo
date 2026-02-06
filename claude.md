# Programmatic SEO Content Generator - Development Guide

## Project Overview

프로그래매틱 SEO 콘텐츠 자동 생성 & 워드프레스 등록 시스템
롱테일 키워드를 활용하여 대량의 SEO 최적화 콘텐츠를 자동으로 생성하고, 워드프레스에 자동 등록하는 시스템

---

## Project Structure

```
claude-progmaticseo/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Dashboard (/)
│   ├── templates/
│   │   ├── page.tsx             # Template list (/templates)
│   │   ├── new/
│   │   │   └── page.tsx         # New template (/templates/new)
│   │   └── [id]/
│   │       └── page.tsx         # Edit template (/templates/[id])
│   ├── generate/
│   │   └── page.tsx             # Content generation (/generate)
│   ├── history/
│   │   └── page.tsx             # Generation history (/history)
│   ├── settings/
│   │   └── page.tsx             # Settings (/settings)
│   └── api/                     # API Routes
│       ├── templates/
│       │   ├── route.ts         # GET, POST templates
│       │   └── [id]/
│       │       └── route.ts     # GET, PUT, DELETE template
│       ├── prompts/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── posts/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── generate/
│       │   └── route.ts         # Content generation endpoint
│       ├── wordpress/
│       │   ├── connect/
│       │   │   └── route.ts     # Test WP connection
│       │   └── publish/
│       │       └── route.ts     # Publish to WordPress
│       ├── ai/
│       │   ├── claude/
│       │   │   └── route.ts     # Claude API endpoint
│       │   └── gemini/
│       │       └── route.ts     # Gemini API endpoint
│       ├── excel/
│       │   └── parse/
│       │       └── route.ts     # Excel parsing endpoint
│       └── settings/
│           └── route.ts         # Settings CRUD
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── progress.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── toast.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── main-layout.tsx
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── recent-posts.tsx
│   │   └── quick-actions.tsx
│   ├── templates/
│   │   ├── template-card.tsx
│   │   ├── template-list.tsx
│   │   ├── template-editor.tsx
│   │   └── template-preview.tsx
│   ├── generate/
│   │   ├── step-indicator.tsx
│   │   ├── template-selector.tsx
│   │   ├── prompt-editor.tsx
│   │   ├── excel-uploader.tsx
│   │   ├── wordpress-config.tsx
│   │   └── progress-monitor.tsx
│   ├── history/
│   │   ├── history-table.tsx
│   │   ├── history-filters.tsx
│   │   └── error-log-download.tsx
│   └── settings/
│       ├── wordpress-settings.tsx
│       ├── api-key-settings.tsx
│       └── general-settings.tsx
├── lib/                          # Core Libraries
│   ├── api/                     # External API integrations
│   │   ├── claude.ts            # Claude API client
│   │   ├── gemini.ts            # Gemini API client
│   │   └── wordpress.ts         # WordPress REST API client
│   ├── template-engine/         # Template processing
│   │   ├── parser.ts            # Template parser
│   │   ├── variable-extractor.ts # Extract {{variables}}
│   │   └── renderer.ts          # Render template with data
│   ├── batch/                   # Batch processing
│   │   ├── processor.ts         # Main batch processor
│   │   ├── queue.ts             # Job queue management
│   │   └── retry.ts             # Retry logic
│   ├── security/                # Security utilities
│   │   ├── encryption.ts        # API key encryption
│   │   └── sanitize.ts          # Input sanitization
│   ├── excel/                   # Excel processing
│   │   ├── parser.ts            # Excel file parser
│   │   └── validator.ts         # Data validation
│   ├── db.ts                    # Prisma client singleton
│   └── utils.ts                 # General utilities
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── hooks/                        # Custom React hooks
│   ├── use-templates.ts
│   ├── use-generate.ts
│   ├── use-settings.ts
│   └── use-progress.ts
├── types/                        # TypeScript types
│   ├── template.ts
│   ├── prompt.ts
│   ├── post.ts
│   ├── settings.ts
│   └── api.ts
├── stores/                       # State management (Zustand)
│   ├── template-store.ts
│   ├── generate-store.ts
│   └── settings-store.ts
├── public/                       # Static files
├── .env.local                   # Environment variables (DO NOT COMMIT)
├── .env.example                 # Example environment variables
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── PRD.md                       # Product Requirements Document
├── TODO.md                      # Development checklist
├── AGENTS.md                    # Sub agents documentation
└── claude.md                    # This file
```

---

## Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js 14 | Framework (App Router) | 14.x |
| TypeScript | Type safety | 5.x |
| Tailwind CSS | Styling | 3.x |
| shadcn/ui | UI Components | latest |
| Zustand | State management | 4.x |
| React Hook Form | Form handling | 7.x |
| react-dropzone | File upload | 14.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js API Routes | Server-side logic | 14.x |
| Prisma | ORM | 5.x |
| PostgreSQL | Database (Vercel) | 15+ |

### External Services
| Service | Purpose |
|---------|---------|
| Claude API | AI content generation |
| Gemini API | AI content generation (alternative) |
| WordPress REST API | Content publishing |
| SheetJS (xlsx) | Excel parsing |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Hosting & Serverless |
| Vercel Postgres | Database |

---

## Coding Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g., `TemplateCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `template-parser.ts`)
- Types: `kebab-case.ts` in `/types` folder
- API Routes: `route.ts` inside appropriate folder

### Component Structure
```tsx
// components/templates/template-card.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Template } from '@/types/template';

interface TemplateCardProps {
  template: Template;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  // Component logic here
  return (
    <Card>
      {/* JSX here */}
    </Card>
  );
}
```

### API Route Structure
```typescript
// app/api/templates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = await prisma.template.create({
      data: body,
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
```

### Import Order
1. React/Next.js imports
2. Third-party library imports
3. Internal components
4. Internal utilities/hooks
5. Types
6. Styles

### TypeScript Guidelines
- Always define types for props, state, and API responses
- Use `interface` for object shapes, `type` for unions/aliases
- Avoid `any` - use `unknown` if type is truly unknown
- Enable strict mode

---

## Database Schema (Prisma)

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
}

model Prompt {
  id          String   @id @default(cuid())
  name        String
  content     String   @db.Text
  aiModel     String   // "claude" or "gemini"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  posts       Post[]
}

model Post {
  id            String   @id @default(cuid())
  title         String
  content       String   @db.Text
  keyword       String
  status        String   // "success", "failed", "pending"
  wpPostId      Int?
  wpUrl         String?
  errorMessage  String?
  templateId    String
  template      Template @relation(fields: [templateId], references: [id])
  promptId      String
  prompt        Prompt   @relation(fields: [promptId], references: [id])
  createdAt     DateTime @default(now())

  @@index([status])
  @@index([createdAt])
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

---

## API Integration Guide

### Claude API

```typescript
// lib/api/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import { decrypt } from '@/lib/security/encryption';

export async function generateWithClaude(
  prompt: string,
  apiKey: string
): Promise<string> {
  const decryptedKey = decrypt(apiKey);

  const client = new Anthropic({
    apiKey: decryptedKey,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const textContent = response.content.find(block => block.type === 'text');
  return textContent?.text || '';
}
```

### Gemini API

```typescript
// lib/api/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt } from '@/lib/security/encryption';

export async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const decryptedKey = decrypt(apiKey);

  const genAI = new GoogleGenerativeAI(decryptedKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
```

### WordPress REST API

```typescript
// lib/api/wordpress.ts
import { decrypt } from '@/lib/security/encryption';

interface WPPostData {
  title: string;
  content: string;
  status: 'draft' | 'publish' | 'pending';
  categories?: number[];
  tags?: number[];
}

export async function createWordPressPost(
  siteUrl: string,
  username: string,
  encryptedPassword: string,
  postData: WPPostData
): Promise<{ id: number; link: string }> {
  const password = decrypt(encryptedPassword);
  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  const response = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create WordPress post');
  }

  const result = await response.json();
  return { id: result.id, link: result.link };
}

export async function testWordPressConnection(
  siteUrl: string,
  username: string,
  encryptedPassword: string
): Promise<boolean> {
  const password = decrypt(encryptedPassword);
  const auth = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

---

## Template Engine

### Variable Syntax
템플릿에서 변수는 `{{변수명}}` 형식으로 표시합니다.

예시:
```html
<h1>{{title}}</h1>
<p>{{main}}</p>
<ul>
  <li>증상: {{symptoms}}</li>
  <li>치료법: {{treatment}}</li>
</ul>
```

### Variable Extraction

```typescript
// lib/template-engine/variable-extractor.ts

export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}
```

### Template Rendering

```typescript
// lib/template-engine/renderer.ts

export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}
```

### AI Response Parsing
AI 응답은 JSON 형식으로 받아 파싱합니다.

```typescript
// lib/template-engine/parser.ts

export function parseAIResponse(response: string): Record<string, string> {
  // JSON 블록 추출 (```json ... ``` 형식 처리)
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonString = jsonMatch ? jsonMatch[1] : response;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error('AI response is not valid JSON');
  }
}
```

---

## Batch Processing

### Processing Logic

```typescript
// lib/batch/processor.ts

interface BatchConfig {
  batchSize: number;
  delayBetweenBatches: number; // milliseconds
  maxRetries: number;
}

interface BatchItem {
  keyword: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  result?: any;
  error?: string;
}

export async function processBatch(
  items: BatchItem[],
  processor: (item: BatchItem) => Promise<any>,
  config: BatchConfig,
  onProgress: (progress: BatchProgress) => void
): Promise<BatchItem[]> {
  const results: BatchItem[] = [];

  for (let i = 0; i < items.length; i += config.batchSize) {
    const batch = items.slice(i, i + config.batchSize);

    // 배치 병렬 처리
    const batchPromises = batch.map(async (item) => {
      item.status = 'processing';

      for (let retry = 0; retry <= config.maxRetries; retry++) {
        try {
          item.result = await processor(item);
          item.status = 'success';
          break;
        } catch (error) {
          if (retry === config.maxRetries) {
            item.status = 'failed';
            item.error = error instanceof Error ? error.message : 'Unknown error';
          } else {
            // 재시도 전 대기
            await delay(1000 * (retry + 1));
          }
        }
      }

      return item;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // 진행 상황 업데이트
    onProgress({
      total: items.length,
      completed: results.length,
      success: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      current: batch[0]?.keyword,
    });

    // 배치 간 딜레이 (Rate Limit 방지)
    if (i + config.batchSize < items.length) {
      await delay(config.delayBetweenBatches);
    }
  }

  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Progress Tracking

```typescript
interface BatchProgress {
  total: number;
  completed: number;
  success: number;
  failed: number;
  current: string;
  percentage: number;
}
```

---

## Security Guide

### API Key Encryption

```typescript
// lib/security/encryption.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY!;

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

### Environment Variables

```bash
# .env.local (NEVER commit to Git)

# Database
DATABASE_URL="postgresql://..."

# Encryption
ENCRYPTION_SECRET_KEY="your-32-character-secret-key-here"

# Optional: Default API Keys (if not stored in DB)
CLAUDE_API_KEY="sk-ant-..."
GEMINI_API_KEY="..."
```

### Security Best Practices
1. **API Keys**: 항상 서버 사이드에서만 처리
2. **DB 저장**: 암호화 후 저장
3. **환경 변수**: 민감한 정보는 환경 변수로 관리
4. **XSS 방지**: 사용자 입력 HTML 처리 시 sanitize
5. **HTTPS**: Vercel 자동 적용

---

## Excel Parsing

### Parser Implementation

```typescript
// lib/excel/parser.ts
import * as XLSX from 'xlsx';

export interface ParsedKeyword {
  keyword: string;
  row: number;
}

export function parseExcelFile(buffer: ArrayBuffer): ParsedKeyword[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Record<string, any>>(firstSheet, {
    header: 1,
  });

  const keywords: ParsedKeyword[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i] as any[];
    if (row && row[0]) {
      keywords.push({
        keyword: String(row[0]).trim(),
        row: i + 1,
      });
    }
  }

  return keywords;
}

export function validateKeywords(keywords: ParsedKeyword[]): {
  valid: ParsedKeyword[];
  invalid: { row: number; reason: string }[];
} {
  const valid: ParsedKeyword[] = [];
  const invalid: { row: number; reason: string }[] = [];

  for (const item of keywords) {
    if (!item.keyword) {
      invalid.push({ row: item.row, reason: 'Empty keyword' });
    } else if (item.keyword.length > 200) {
      invalid.push({ row: item.row, reason: 'Keyword too long (max 200)' });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
}
```

---

## Git Workflow

### Commit Convention (Conventional Commits)
```
<type>: <description>

Types:
- feat: 새 기능
- fix: 버그 수정
- style: UI/스타일 변경
- docs: 문서 변경
- refactor: 리팩토링
- chore: 기타 작업
- test: 테스트 추가/수정
```

### Commit Examples
```bash
feat: implement template CRUD system
fix: resolve WordPress connection error
style: update dashboard card layout
docs: add API documentation
refactor: extract template parser to separate module
chore: update dependencies
```

### Branch Strategy
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치 (선택적)
- Feature branches: `feat/feature-name`

---

## Sub Agents

이 프로젝트는 7개의 전문 Sub Agent로 구성됩니다. 각 Agent는 특정 영역을 담당합니다.

| Agent | 담당 영역 | 주요 파일/폴더 |
|-------|----------|--------------|
| ui-developer | UI 컴포넌트, 스타일 | `/components`, `/app` pages |
| api-integrator | 외부 API 연동 | `/lib/api`, `/app/api` |
| db-architect | DB 설계, Prisma | `/prisma`, data models |
| template-engine-specialist | 템플릿 처리 | `/lib/template-engine` |
| batch-processor | 배치 작업 처리 | `/lib/batch` |
| security-specialist | 보안, 암호화 | `/lib/security` |
| excel-parser | 엑셀 파싱 | `/lib/excel` |

자세한 Agent 정보는 `AGENTS.md` 파일을 참조하세요.

---

## Development Commands

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start

# Prisma
npx prisma generate       # Client 생성
npx prisma db push        # Schema 적용 (개발)
npx prisma migrate dev    # Migration 생성 및 적용
npx prisma studio         # DB GUI

# Lint
npm run lint
```

---

## Design System

### Colors
```css
/* Primary */
--primary: #3B82F6;      /* Blue - Trust */
--primary-hover: #2563EB;

/* Secondary */
--secondary: #10B981;    /* Green - Success */
--secondary-hover: #059669;

/* Danger */
--danger: #EF4444;       /* Red - Error */
--danger-hover: #DC2626;

/* Neutrals */
--background: #F9FAFB;
--surface: #FFFFFF;
--border: #E5E7EB;
--text-primary: #1F2937;
--text-secondary: #6B7280;
```

### Typography
- **Font**: Inter (Latin), Pretendard (Korean)
- **Monospace**: Fira Code, JetBrains Mono

### Responsive
- Desktop-first (min-width: 1280px)
- 모바일 지원 불필요 (개인용)

---

## Troubleshooting

### Common Issues

1. **Prisma Client Not Found**
   ```bash
   npx prisma generate
   ```

2. **Database Connection Error**
   - `.env.local`의 `DATABASE_URL` 확인
   - Vercel Dashboard에서 DB 상태 확인

3. **AI API Rate Limit**
   - `batchSize` 줄이기
   - `delayBetweenBatches` 늘리기

4. **WordPress Connection Failed**
   - Application Password 사용 중인지 확인
   - REST API 활성화 여부 확인
   - URL 형식 확인 (https://)

---

## Troubleshooting Guides

### Template Variable Substitution Issues

If you experience issues with template variables not being substituted (showing empty values), see the comprehensive guide:

**📖 [VARIABLE_FIX_GUIDE.md](./VARIABLE_FIX_GUIDE.md)**

**Quick Summary:**
- The system supports `{{keyword}}`, `{{키워드}}`, and `{{disease_code}}`
- Update your prompts to use `{{keyword}}` and provide clear JSON structure to AI
- Update your templates to use consistent variable names
- Ensure AI returns all required fields in JSON response

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Claude API](https://docs.anthropic.com/)
- [Gemini API](https://ai.google.dev/docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
