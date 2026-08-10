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
