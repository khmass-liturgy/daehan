# daehan (GitHub Pages 저장소)

대한가축약품 Firestore 조회 웹앱(`index.html`)의 GitHub Pages 배포 저장소.
로컬 원본은 `C:\daehan\firestore_project\web\index.html`이며, 이 저장소는 그 사본을 배포하는 용도.
Firebase 프로젝트: `daehan-adb1d`. 접속 코드: `daehan2024` (index.html 내 `ACCESS_CODE`).

## 커밋/푸시 워크플로우 (자동, 확인 불필요)

기능 추가·수정 작업을 완료하고 브라우저에서 동작 확인까지 마쳤다면, "커밋할까요?" 라고 묻지 말고
바로 `git add` → `git commit` → `git push origin main`까지 자동으로 진행한다.

- 이 저장소는 `.github` 빌드 단계가 없는 순수 정적 사이트라 push가 곧 배포다. 별도 "사이트 반영" 단계 없음.
- 적용 범위: 새 탭/기능 추가, 버그 수정 등 "구현 후 브라우저에서 테스트 완료"된 작업.
- 예외(여전히 확인 후 진행): 데이터 삭제 등 파괴적 작업, 미완성/실험적 변경, 스코프가 애매한 변경.
- 커밋 전 `git status`/`git diff`로 변경사항 확인하는 절차는 생략하지 않는다.
- 로컬 사본(`C:\daehan\firestore_project\web\index.html`)과 항상 동기화 상태 유지.

## ⚠️ 주의: 이 저장소는 두 곳에서 편집될 수 있음

이 저장소는 `C:\daehan` 세션에서 로컬 사본을 복사해오는 방식으로도 편집되고, 이 폴더(`C:\Users\user\OneDrive\GitHub-daehan\daehan`)에 있는 `.claude`를 통해 여기서 직접 세션이 열려 편집되기도 한다. 2026-08-19에 `C:\daehan` 세션이 오래된 로컬 사본을 그대로 `cp`+커밋+푸시해서, 그 사이 여기서 직접 작업된 커밋 4개(자동정렬/날짜검색/매출일 폴백/탭 이름변경)를 통째로 되돌려버린 사고가 있었다(즉시 `git revert`로 복구함).

- `C:\daehan` 쪽에서 작업 시작 전: 먼저 `git log --oneline -5`로 HEAD가 마지막으로 알고 있던 커밋과 같은지 확인한다. 다르면(다른 커밋이 앞서 있으면) 로컬 사본을 무시하고 저장소의 현재 `index.html`을 기준으로 변경사항을 다시 적용할 것.
- 이 폴더에서 직접 작업 시: 완료 후 `C:\daehan\firestore_project\web\index.html`에도 최신 `index.html`을 복사해둬서 다음에 `C:\daehan` 세션이 열릴 때 다시 이 사고가 나지 않도록 한다.
