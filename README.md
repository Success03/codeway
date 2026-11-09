# CODEWAY — 하루 제한 없는 코딩 학습 앱

**CODEWAY**는 한국어로 HTML, CSS, JavaScript, Python을 배울 수 있는 무료 모바일 웹앱(PWA)입니다. 기존 유료 학습 앱과 관련 없는 독립적인 학습 앱입니다.

## 무엇이 들어 있나요?

- 총 **112개 학습 단계**: HTML·CSS·JavaScript·Python 각 24개 코딩 실습 + 각 4개 퀴즈
- 하트, 일일 횟수, 광고, 결제, 학습 잠금 없음
- 직접 코드 작성 및 정답 확인, 힌트, 정답 보기, 예제 다시 풀기
- HTML/CSS 화면 미리보기, JavaScript 콘솔 실행, Python 실행(Pyodide 오픈소스)
- 자유 코딩 연습장, 랜덤 복습, 진도/XP/연속 학습 기록
- 학습 기록을 브라우저에 보관하고 JSON으로 백업·복원
- iPhone/Android 홈 화면 추가 가능
- 앱 콘텐츠는 첫 로드 후 오프라인으로 열 수 있음. **Python 실행의 첫 엔진 다운로드는 인터넷이 필요함**.

## 아이폰에서 홈 화면 앱처럼 사용하기 — GitHub Pages

직접 만든 앱을 안전하게 설치하려면 무료 GitHub Pages에 올리는 것이 편합니다.

1. GitHub에서 **새 Public repository**를 만듭니다. 예: `codeway`. 기존에 만든 다른 앱의 저장소는 수정하지 마세요.
2. 이 ZIP 압축을 풀고, **아래 9개 파일을 저장소 맨 위(root)에 업로드**합니다. ZIP 자체를 업로드하는 것이 아닙니다.
   - `index.html`
   - `styles.css`
   - `app.js`
   - `lessons.js`
   - `sw.js`
   - `manifest.webmanifest`
   - `icon.svg`
   - `icon-192.png`
   - `icon-512.png`
3. GitHub 저장소의 **Settings → Pages → Build and deployment → Deploy from a branch**를 선택합니다.
4. Branch `main`, folder `/ (root)`를 선택해 저장합니다.
5. GitHub Pages에 표시된 웹사이트 주소를 **아이폰 Safari**로 엽니다.
6. Safari의 **공유 → 홈 화면에 추가**를 누르면 아이콘이 생성됩니다.

예상 사이트 주소 형식: `https://깃허브아이디.github.io/codeway/` (저장소 이름에 따라 달라짐). 실제 배포 주소는 GitHub Pages 화면에서 확인하세요.

## 컴퓨터에서 시험하기

`index.html`을 브라우저로 열면 대부분의 콘텐츠를 미리 볼 수 있습니다. 단, 코드 실행 및 오프라인 저장 기능을 정상적으로 사용하려면 GitHub Pages 등 HTTPS 웹서버에서 열어야 합니다.

## 참고

- 학습 기록은 **기기별·브라우저별로 따로 저장**됩니다. 계정/클라우드 동기화는 아직 없습니다.
- 브라우저 데이터가 삭제되거나 앱이 지워지면 기록이 사라질 수 있으므로 **내 기록 → 백업 파일 저장**을 사용하세요.
- JavaScript 실행은 별도 Worker로 분리하고 실행 시간을 제한합니다. HTML 미리보기는 샌드박스에 표시합니다.
- Python 실행은 Pyodide 오픈소스를 CDN에서 가져와 브라우저에서 실행합니다. 서버에 코드를 업로드하는 방식이 아닙니다.
- 이것은 학습용 첫 버전(MVP)이며, 전체 언어 학습 과정이나 전문 개발 환경을 완전히 대체하지는 않습니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 앱 시작 페이지 |
| `styles.css` | 반응형 디자인 |
| `lessons.js` | 112개 한국어 학습 단계 |
| `app.js` | 앱 화면, 진도 저장, 코드 실행 기능 |
| `sw.js` | PWA 오프라인 캐싱 |
| `manifest.webmanifest` | 홈 화면 앱 정보 |
| `icon.svg`, `icon-192.png`, `icon-512.png` | 앱 아이콘 |

## v2 반응형 디자인
- 모바일 780px 미만: 기존 하단 메뉴/모바일 학습 레이아웃 유지
- 태블릿 780px 이상: 왼쪽 아이콘 내비게이션, 넓어진 콘텐츠
- 데스크톱 1180px 이상: 왼쪽 사이드바, 4열 언어 과정, 2열 학습/코딩 영역, 편집기와 결과 나란히 보기
- 기존 브라우저 학습 기록 키(`codeway_state_v1`) 변경하지 않음
