# THE MCR NATION

MCR 팬 커뮤니티 MVP입니다. Draag의 행정 기록·선전물 시각 언어와 실제 팬 커뮤니티의 가독성을 결합합니다.

## 실행

```bash
npm install
npm run dev   # http://localhost:5173
```

## 서버 연결 (Supabase + 카카오 로그인)

1. `.env.local.example`을 `.env.local`로 복사해 Supabase URL·Publishable key 입력
2. Supabase SQL Editor에서 `supabase/migrations/0001_init.sql` 실행
3. 익명 로그인·Kakao Provider 설정 → `docs/05-supabase-kakao-setup.md`

`.env.local`이 비어 있으면 브라우저에만 저장하는 로컬 모드로 동작합니다.
