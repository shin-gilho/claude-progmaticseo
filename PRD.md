# PRD: 프로그래매틱 SEO 콘텐츠 자동 생성 시스템

## 📋 문서 정보
- **버전**: 1.0
- **최종 수정일**: 2026-02-06
- **작성자**: Product Owner

---

## 📋 프로젝트 개요

### 프로젝트명
프로그래매틱 SEO 콘텐츠 자동 생성 & 워드프레스 등록 시스템

### 목적
롱테일 키워드를 활용하여 대량의 SEO 최적화 콘텐츠를 자동으로 생성하고, 워드프레스에 자동 등록하는 시스템 구축

### 해결하고자 하는 문제
- 수작업으로 유사한 구조의 SEO 콘텐츠를 반복 작성하는 비효율성
- 질병코드, 정책지원금 등 변수만 다른 콘텐츠를 대량 생성해야 하는 니즈
- 워드프레스 수동 등록의 번거로움
- AI를 활용한 자동화로 시간 절약 및 생산성 향상

### 목표 사용자
- 개인 비즈니스 운영자 (본인 전용)
- SEO 콘텐츠 마케팅 전문가

### 핵심 가치 제안
- **템플릿 + AI 혼합 방식**: 구조화된 템플릿에 AI가 생성한 콘텐츠를 자동 삽입
- **대량 생성 자동화**: 엑셀 업로드만으로 10~100개의 콘텐츠를 자동 생성
- **워드프레스 직접 연동**: 생성 즉시 워드프레스에 임시저장 상태로 등록
- **유연한 확장성**: 질병코드, 정책지원금 등 다양한 주제에 재사용 가능

---

## 🎯 프로젝트 범위

### MVP 기능 (Phase 1)
**필수 핵심 기능:**
- [x] 템플릿 관리 시스템 (생성, 수정, 삭제, 선택)
- [x] AI 프롬프트 커스터마이징 (Claude/Gemini API 선택)
- [x] 엑셀 파일 업로드 (키워드 리스트)
- [x] AI 기반 콘텐츠 자동 생성
- [x] 워드프레스 REST API 연동 (임시저장 등록)
- [x] 실시간 진행 상황 모니터링
- [x] 생성 기록 관리 및 확인
- [x] 에러 처리 및 재실행 기능

### 향후 확장 가능 기능 (Phase 2)
- [ ] 템플릿 마켓플레이스 (공유/재사용)
- [ ] 일정 예약 생성 (크론잡)
- [ ] 다중 워드프레스 사이트 동시 관리
- [ ] AI 생성 콘텐츠 품질 평가 시스템
- [ ] SEO 점수 자동 분석
- [ ] 이미지 자동 생성 및 삽입 (AI 이미지 생성)

### 제외 항목
- 사용자 인증/로그인 시스템 (본인만 사용)
- 모바일 앱
- 실시간 협업 기능

---

## 🔧 핵심 기능 명세

### 1. 템플릿 관리 시스템
**설명**: HTML 기반 콘텐츠 템플릿을 생성하고 관리하는 기능

**주요 요소:**
- 템플릿 생성/수정/삭제
- 템플릿 목록 보기
- 템플릿 선택 (작업 시 사용할 템플릿 선택)
- 템플릿 복제 기능
- 변수 문법 지원 (예: `{{main}}`, `{{질병명}}`, `{{카테고리}}`)

**사용자 인터랙션:**
- 웹 에디터에서 HTML 템플릿 작성
- 변수 위치를 `{{변수명}}` 형식으로 표시
- 저장 후 템플릿 목록에서 선택 가능

**우선순위**: High

---

### 2. AI 프롬프트 시스템
**설명**: AI에게 어떤 정보를 생성할지 지시하는 프롬프트 관리

**주요 요소:**
- 프롬프트 작성/수정 인터페이스
- AI 모델 선택 (Claude API / Gemini API)
- 프롬프트 저장 및 재사용
- 변수 매핑 설정 (엑셀 키워드 → AI 응답 → 템플릿 변수)

**사용자 인터랙션:**
- 텍스트 에디터에서 프롬프트 작성
- 예시: "다음 질병코드에 대한 정보를 JSON 형식으로 제공해줘: 질병명, 카테고리, 주요 증상, 보험 청구 방법"
- AI 모델 드롭다운에서 선택 (Claude/Gemini)

**우선순위**: High

---

### 3. 엑셀 업로드 및 키워드 관리
**설명**: 키워드 리스트를 엑셀로 업로드하여 대량 생성 준비

**주요 요소:**
- 엑셀 파일 업로드 (.xlsx, .csv)
- A열 첫 번째 컬럼에서 키워드 자동 읽기
- 업로드된 키워드 미리보기
- 키워드 개수 확인

**사용자 인터랙션:**
- 파일 드래그 앤 드롭 또는 클릭 업로드
- 업로드 후 키워드 리스트 테이블로 표시
- 잘못된 키워드 수정 가능

**우선순위**: High

---

### 4. AI 콘텐츠 자동 생성 엔진
**설명**: 템플릿 + AI 응답을 결합하여 최종 콘텐츠 생성

**주요 요소:**
- 키워드별 AI API 호출 (5개씩 배치 처리)
- AI 응답을 템플릿 변수에 자동 삽입
- 생성된 HTML 콘텐츠 미리보기
- 실패 시 재시도 로직

**프로세스:**
1. 엑셀에서 키워드 읽기
2. AI 프롬프트에 키워드 삽입하여 API 호출
3. AI 응답 파싱 (JSON 등)
4. 템플릿의 `{{변수}}` 부분을 AI 응답으로 치환
5. 최종 HTML 생성

**우선순위**: High

---

### 5. 워드프레스 자동 등록
**설명**: 생성된 콘텐츠를 WordPress REST API를 통해 자동 등록

**주요 요소:**
- WordPress 사이트 URL, 인증 정보 입력
- 카테고리, 태그 설정
- 임시저장 상태로 포스트 생성
- 등록 성공/실패 상태 확인

**사용자 인터랙션:**
- WordPress 연결 설정 페이지
- 카테고리 선택 (드롭다운 또는 직접 입력)
- 태그 입력 (콤마로 구분)
- "워드프레스 등록" 버튼 클릭

**우선순위**: High

---

### 6. 실시간 진행 상황 모니터링
**설명**: 콘텐츠 생성 및 워드프레스 등록 진행률을 실시간으로 표시

**주요 요소:**
- 프로그레스 바 (0~100%)
- 현재 처리 중인 키워드 표시
- 성공/실패 카운트
- 예상 소요 시간

**사용자 인터랙션:**
- 생성 시작 후 자동으로 진행 상황 표시
- "일시정지", "중단" 버튼 제공

**우선순위**: Medium

---

### 7. 생성 기록 관리
**설명**: 생성한 콘텐츠의 히스토리를 저장하고 확인

**주요 요소:**
- 생성된 글 목록 (제목, 생성일, 상태)
- 워드프레스 링크 (클릭 시 해당 포스트로 이동)
- 필터링 (성공/실패, 날짜별)
- 검색 기능

**사용자 인터랙션:**
- 대시보드에서 생성 기록 테이블 확인
- 각 행 클릭 시 상세 정보 보기
- 워드프레스 링크 클릭 시 새 탭에서 포스트 열기

**우선순위**: Medium

---

### 8. 에러 처리 및 재실행
**설명**: 실패한 작업을 재시도하고 에러 로그를 관리

**주요 요소:**
- 실패한 항목 목록 표시
- 실패 원인 표시 (AI API 오류, 워드프레스 오류 등)
- 실패한 항목만 선택하여 재실행
- 에러 로그 다운로드 (.txt, .csv)

**사용자 인터랙션:**
- 실패 항목 체크박스 선택
- "재실행" 버튼 클릭
- "에러 로그 다운로드" 버튼 클릭

**우선순위**: High

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (선택적)
- **State Management**: React Context API 또는 Zustand
- **Form Handling**: React Hook Form
- **File Upload**: react-dropzone

### Backend
- **Framework**: Next.js API Routes (서버리스)
- **Language**: TypeScript
- **Database**: 
  - 로컬 개발: SQLite (또는 JSON 파일)
  - Vercel 배포: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma

### 외부 API & 서비스
- **AI API**: 
  - Claude API (Anthropic)
  - Gemini API (Google)
- **WordPress**: REST API v2
- **엑셀 파싱**: SheetJS (xlsx)

### 인프라 & 배포
- **Hosting**: Vercel
- **Database**: Vercel Postgres (또는 Supabase)
- **환경 변수 관리**: Vercel Environment Variables

### 보안
- **API 키 암호화**: crypto-js
- **환경 변수**: .env.local (절대 Git에 커밋 안 함)

---

## 🎨 디자인 요구사항

### 디자인 컨셉
- **스타일**: 전문적이고 신뢰감 있는, 깔끔한 관리 도구
- **무드**: 미니멀, 효율적, 데이터 중심
- **참고 사이트**: 
  - Notion (깔끔한 UI)
  - Vercel Dashboard (전문적인 느낌)
  - Linear (미니멀한 디자인)

### 색상 팔레트
- **Primary**: #3B82F6 (파란색 - 신뢰감)
- **Secondary**: #10B981 (녹색 - 성공)
- **Danger**: #EF4444 (빨간색 - 에러)
- **Background**: #F9FAFB (밝은 회색)
- **Text**: #1F2937 (진한 회색)

### 타이포그래피
- **본문**: Inter, Pretendard (한글)
- **코드**: Fira Code, JetBrains Mono

### 반응형 디자인
- **우선순위**: Desktop-first (데스크톱 전용)
- **최소 해상도**: 1280px 이상

---

## 📱 페이지 구조

### URL 구조
```
/ → 대시보드 (홈)
/templates → 템플릿 관리
/templates/new → 새 템플릿 생성
/templates/[id] → 템플릿 수정
/generate → 콘텐츠 생성 페이지
/history → 생성 기록
/settings → 설정 (WordPress 연동, API 키)
```

### 주요 페이지 레이아웃

#### 1. 대시보드 (/)
- 최근 생성 기록 요약 (5개)
- 통계: 총 생성 수, 성공률, 최근 활동
- 빠른 실행 버튼 (새 템플릿, 콘텐츠 생성)

#### 2. 템플릿 관리 (/templates)
- 템플릿 목록 (카드 형태 또는 테이블)
- 각 템플릿: 제목, 미리보기, 마지막 수정일
- "새 템플릿" 버튼
- 검색 및 필터링

#### 3. 템플릿 생성/수정 (/templates/new, /templates/[id])
- HTML 에디터 (코드 하이라이팅)
- 변수 삽입 가이드 (예: `{{변수명}}`)
- 미리보기 패널
- 저장/취소 버튼

#### 4. 콘텐츠 생성 (/generate)
**Step-by-step 프로세스:**
- Step 1: 템플릿 선택
- Step 2: AI 프롬프트 작성/선택
- Step 3: 엑셀 업로드
- Step 4: WordPress 설정 (카테고리, 태그)
- Step 5: 생성 실행 및 진행 상황 모니터링

#### 5. 생성 기록 (/history)
- 테이블 형태 (제목, 생성일, 상태, 워드프레스 링크)
- 필터: 전체/성공/실패
- 검색창
- 에러 로그 다운로드 버튼

#### 6. 설정 (/settings)
- WordPress 연동 정보 (URL, 인증)
- AI API 키 설정 (Claude/Gemini)
- 기본 설정 (배치 크기, 타임아웃 등)

---

## 📊 데이터 구조

### Database Schema (Prisma)

#### Template (템플릿)
```prisma
model Template {
  id          String   @id @default(cuid())
  name        String
  htmlContent String   @db.Text
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  posts       Post[]
}
```

#### Prompt (AI 프롬프트)
```prisma
model Prompt {
  id          String   @id @default(cuid())
  name        String
  content     String   @db.Text
  aiModel     String   // "claude" or "gemini"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  posts       Post[]
}
```

#### Post (생성된 콘텐츠)
```prisma
model Post {
  id              String   @id @default(cuid())
  title           String
  content         String   @db.Text
  keyword         String
  status          String   // "success", "failed", "pending"
  wpPostId        Int?     // WordPress 포스트 ID
  wpUrl           String?  // WordPress 포스트 URL
  errorMessage    String?
  templateId      String
  template        Template @relation(fields: [templateId], references: [id])
  promptId        String
  prompt          Prompt   @relation(fields: [promptId], references: [id])
  createdAt       DateTime @default(now())
}
```

#### Settings (설정)
```prisma
model Settings {
  id              String   @id @default(cuid())
  wpSiteUrl       String
  wpUsername      String
  wpPassword      String   // 암호화 저장
  claudeApiKey    String?  // 암호화 저장
  geminiApiKey    String?  // 암호화 저장
  defaultAiModel  String   @default("claude")
  batchSize       Int      @default(5)
  updatedAt       DateTime @updatedAt
}
```

---

## 🔐 보안 요구사항

### API 키 및 인증 정보 보호
- **암호화**: crypto-js를 사용하여 DB 저장 전 암호화
- **환경 변수**: 서버에서만 접근 가능한 환경 변수로 관리
- **클라이언트 숨김**: API 키는 절대 클라이언트에 노출 안 됨

### WordPress 인증
- **Application Passwords** 사용 (WordPress 5.6+)
- REST API 인증 시 Basic Auth 또는 JWT 토큰

### HTTPS
- Vercel 자동 HTTPS 적용

---

## 🚀 개발 단계

### Phase 1: 기획 & 디자인 (1일)
- [x] PRD 완료
- [x] 기술 스택 확정
- [ ] 와이어프레임 스케치

### Phase 2: 개발 환경 세팅 (1일)
- [ ] Next.js 프로젝트 초기화
- [ ] Prisma + PostgreSQL 설정
- [ ] Git 설정 및 GitHub 연결
- [ ] Vercel 프로젝트 생성

### Phase 3: 핵심 기능 개발 (5-7일)
- [ ] 템플릿 CRUD 구현
- [ ] AI 프롬프트 시스템 구현
- [ ] 엑셀 업로드 및 파싱
- [ ] AI API 연동 (Claude/Gemini)
- [ ] 템플릿 + AI 응답 결합 로직
- [ ] WordPress REST API 연동
- [ ] 배치 처리 시스템 (5개씩)

### Phase 4: UI/UX 구현 (3-4일)
- [ ] 대시보드 UI
- [ ] 템플릿 관리 페이지
- [ ] 콘텐츠 생성 페이지 (Step-by-step)
- [ ] 생성 기록 페이지
- [ ] 설정 페이지
- [ ] 실시간 진행 상황 UI

### Phase 5: 에러 처리 & 최적화 (2-3일)
- [ ] 에러 핸들링 로직
- [ ] 재실행 기능
- [ ] 에러 로그 다운로드
- [ ] API 레이트 리밋 대응
- [ ] 성능 최적화

### Phase 6: 테스트 & 디버깅 (2일)
- [ ] 로컬 테스트 (다양한 케이스)
- [ ] WordPress 연동 테스트
- [ ] AI API 응답 검증
- [ ] 버그 수정

### Phase 7: 배포 & 런칭 (1일)
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] 데이터베이스 마이그레이션
- [ ] 최종 테스트

---

## 📋 체크리스트

### 개발 전
- [x] PRD 검토 및 승인
- [x] 기술 스택 확정
- [ ] 디자인 시스템 정의
- [ ] Git Repository 생성

### 개발 중
- [ ] 코드 리뷰 (자체)
- [ ] API 연동 테스트
- [ ] 에러 핸들링 구현
- [ ] 보안 검토

### 배포 전
- [ ] 전체 기능 테스트
- [ ] WordPress 연동 확인
- [ ] AI API 키 보안 확인
- [ ] Vercel 환경 변수 설정
- [ ] 데이터베이스 백업 계획

### 배포 후
- [ ] 모니터링 설정
- [ ] 사용자 가이드 작성
- [ ] 버그 트래킹 시스템

---

## 📞 연락처 및 리소스

### GitHub Repository
- **저장소 URL**: (배포 후 추가)

### API 문서
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **Claude API**: https://docs.anthropic.com/
- **Gemini API**: https://ai.google.dev/docs

### 참고 자료
- **Programmatic SEO 가이드**: https://backlinko.com/programmatic-seo
- **Next.js 문서**: https://nextjs.org/docs
- **Prisma 문서**: https://www.prisma.io/docs

---

## 🎯 성공 지표

### 단기 목표 (1개월)
- 템플릿 3개 이상 생성
- 총 100개 이상의 콘텐츠 생성
- WordPress 자동 등록 성공률 95% 이상

### 중기 목표 (3개월)
- 다양한 주제로 확장 (질병, 정책, 지원금 등)
- AI 생성 콘텐츠 품질 개선
- 생성 속도 최적화 (5분 내 100개 생성)

---

**문서 버전**: 1.0  
**최종 수정일**: 2026-02-06