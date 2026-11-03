# THE MCR NATION

MCR 팬 커뮤니티 MVP입니다. Draag의 행정 기록·선전물 시각 언어와 실제 팬 커뮤니티의 가독성을 결합합니다.

## 진행 문서

- [`docs/00-product-brief.md`](docs/00-product-brief.md) — 확정 사항과 보류 사항
- [`docs/01-design-system.md`](docs/01-design-system.md) — 디자인 토큰과 UX 원칙
- [`docs/02-mvp-build-plan.md`](docs/02-mvp-build-plan.md) — 체크 가능한 구현 순서
- [`docs/03-auth-and-moderation.md`](docs/03-auth-and-moderation.md) — 카카오/익명 기록·신고 정책

## 로컬 실행

```bash
npm install
npm run dev
```

카카오 로그인과 다중 사용자 데이터 동기화는 Supabase 프로젝트·Kakao 앱 키를 넣은 뒤 활성화합니다. 그 전에도 익명 별칭, 게시물, 댓글, 셋리스트 월드컵은 해당 브라우저에서 실제로 저장·동작합니다.
