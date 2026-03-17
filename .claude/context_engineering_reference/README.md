# Context Engineering Reference

이 프로젝트의 `.claude/` 디렉터리(CLAUDE.md, docs/, settings 등)를 설계할 때 참고한 글 모음.

---

## 1. OMS에서 Claude AI를 활용하여 변화된 업무 방식 — 컬리 기술 블로그

- **링크**: https://helloworld.kurly.com/blog/oms-claude-ai-workflow/
- **저자**: 이준환 (OMS팀)
- **발행일**: 2025-12-24

### 핵심 내용

4명의 작은 팀(PM 1 + 엔지니어 3)이 Claude AI와 체계적인 Context 설계를 통해 12개 MSA를 운영하는 사례.

- **역할 분리**: TPM AI(전체 아키텍처 설계)와 MSA AI(서비스별 구현)를 분리하여 관심사를 나눔
- **Context 폴더 이분화**: `ai-context/`(지식 — 도메인, API, 데이터 모델)와 `skills/`(행동 — 개발, 배포 워크플로우)로 구분
- **JSON DSL 활용**: 자연어 대비 3배 적은 토큰으로 더 명확한 정보 전달
- **아키텍처 상관성**: MSA + 클린 아키텍처 조합이 AI Context 설계에 가장 유리. UseCase/Port/Adapter 분리가 불필요한 컨텍스트 노이즈를 최소화
- **검증 우선순위**: AI가 작성한 코드보다 TPM AI의 1차 설계를 팀 전체가 검토하는 것이 더 중요
- **팀 그라운드 룰**: "AI 답변을 신입 개발자의 제안이라 생각하고 꼼꼼히 검증"

---

## 2. Software 3.0 시대, Harness를 통한 조직 생산성 저점 높이기 — 토스 기술 블로그

- **링크**: https://toss.tech/article/harness-for-team-productivity
- **저자**: 김용성 (토스페이먼츠 Node.js Developer)
- **발행일**: 2026-02-26

### 핵심 내용

LLM을 개인 도구가 아닌 조직 시스템으로 편입시켜야 한다는 주장. 같은 도구를 써도 컨텍스트 세팅 여부에 따라 10분 vs 1시간의 격차가 발생한다.

- **Frictionless Harness**: 개발자가 가장 많은 시간을 보내는 터미널에서 자연어와 코드를 끊김 없이 섞는 경험 → 팀 전체에 저항감 없이 전파
- **Executable SSOT**: 플러그인 형태의 지식은 인간이 읽으면 업무 가이드, LLM이 읽으면 시스템 프롬프트가 되는 이중 기능 수행. 기존 위키 문서의 "낡은 정보" 문제 해결
- **Raising the Floor**: 팀 내 LLM 활용 노하우 편차를 해소하려면 개인 센스가 아닌 조직 차원의 시스템화가 필요
- **Layered Architecture**: Global(전사 공통) → Domain(팀/비즈니스) → Local(레포 구현) 계층화된 지식 구조
- **Software 1.0과의 연속성**: 공통 모듈화 → AI 워크플로우 플러그인. 내부 구성만 코드에서 프롬프트로 변했을 뿐, 엔지니어링 본질은 동일

---

## 3. 소프트웨어 3.0 시대를 맞이하며 — 토스 기술 블로그

- **링크**: https://toss.tech/article/software-3-0-era
- **저자**: 김용성 (토스페이먼츠 Node.js Developer)
- **발행일**: 2026-01-26

### 핵심 내용

Software 1.0(명시적 코드) → 2.0(신경망) → 3.0(LLM + 자연어) 진화 과정에서, LLM을 실제 업무에 연결하는 Harness의 개념과 설계 원칙.

- **Harness = 마구**: LLM은 혼자서는 파일 읽기, API 호출, DB 접근이 불가능. Memory 관리, 사실 근거 제공(환각 방지), 외부 시스템 연결, 상태 관리를 Harness가 담당
- **Claude Code를 레이어드 아키텍처로 재해석**: Slash Command = Controller, Sub-agent = Service, Skills = Domain Component, MCP = Adapter, CLAUDE.md = package.json
- **토큰은 메모리다**: Context Window를 메모리처럼 관리. CLAUDE.md, Skills, 대화 히스토리가 모두 Context를 점유하므로 효율적 배분이 핵심
- **Skill 설계 원칙**: God Skill 안티패턴 피하기, Progressive Disclosure(필요할 때만 로드), Facade 패턴 활용
- **Human-in-the-Loop**: 되돌리기 어려운 작업, 정답 없는 결정, 비용/리스크 큰 선택에서는 사용자에게 판단을 위임
- **기존 지식의 계승**: 응집도, 결합도, SRP, 레이어 분리 등 소프트웨어 엔지니어링 기본 원칙은 Software 3.0에서도 여전히 유효
