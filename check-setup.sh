#!/usr/bin/env bash
# check-setup.sh
# 병렬 AI 에이전트 개발 시작 전, 연동 상태를 한 번에 점검하는 스크립트.
# 새 터미널에서 Claude Code를 실행하기 *전에* 먼저 이걸 돌려서
# "진짜 다 연동돼있는지"를 사람이 직접 확인하는 용도입니다.

set -e

echo "========================================"
echo "1. Git 레포 상태"
echo "========================================"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 && echo "✅ Git 레포 내부입니다." || echo "❌ Git 레포가 아닙니다."
echo "- remote:"
git remote -v || true
echo "- 현재 브랜치: $(git branch --show-current 2>/dev/null || echo '알 수 없음')"
echo "- 변경사항 있는지:"
git status -s || true

echo ""
echo "========================================"
echo "2. Vercel 연동 상태"
echo "========================================"
if command -v vercel >/dev/null 2>&1; then
  echo "✅ vercel CLI 설치됨"
  vercel whoami || echo "⚠️ vercel 로그인 필요 (vercel login)"
  if [ -f .vercel/project.json ]; then
    echo "✅ 이 디렉토리는 Vercel 프로젝트와 링크되어 있습니다."
    cat .vercel/project.json
  else
    echo "⚠️ .vercel/project.json 이 없습니다 → 'vercel link' 필요"
  fi
else
  echo "❌ vercel CLI가 설치되어 있지 않습니다. (npm i -g vercel)"
fi

echo ""
echo "========================================"
echo "3. Supabase 연동 상태"
echo "========================================"
if command -v supabase >/dev/null 2>&1; then
  echo "✅ supabase CLI 설치됨"
  if [ -f supabase/config.toml ]; then
    echo "✅ supabase 프로젝트 초기화됨 (supabase/config.toml 존재)"
  else
    echo "⚠️ supabase/config.toml 이 없습니다 → 'supabase init' 또는 'supabase link' 필요"
  fi
  supabase projects list 2>/dev/null || echo "⚠️ supabase 로그인 필요 (supabase login)"
else
  echo "❌ supabase CLI가 설치되어 있지 않습니다. (npm i -g supabase)"
fi

echo ""
echo "========================================"
echo "4. 환경변수 체크 (.env / .env.local)"
echo "========================================"
for f in .env .env.local; do
  if [ -f "$f" ]; then
    echo "✅ $f 존재"
    grep -E '^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY)=' "$f" \
      | sed -E 's/=.*/=(설정됨, 값은 숨김)/' || echo "  ⚠️ Supabase 관련 키를 찾지 못했습니다."
  else
    echo "⚠️ $f 없음"
  fi
done

echo ""
echo "========================================"
echo "5. CLAUDE.md 존재 여부"
echo "========================================"
if [ -f CLAUDE.md ]; then
  echo "✅ CLAUDE.md 존재 (Claude Code가 세션 시작 시 자동으로 읽습니다)"
else
  echo "❌ CLAUDE.md 가 레포 루트에 없습니다. 먼저 추가하세요."
fi

echo ""
echo "점검 끝. 위에 ❌ 또는 ⚠️ 가 있다면 해결한 뒤 Claude Code를 시작하세요."
