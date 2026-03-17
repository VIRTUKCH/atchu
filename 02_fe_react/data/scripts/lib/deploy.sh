#!/usr/bin/env bash

# 프론트엔드 빌드, Vercel 배포, 데이터 git push.
run_front_build() {
  if [[ -z "${VERCEL_TOKEN:-}" ]]; then
    resolve_npm_cmd
    log "Build started: npm run build (no VERCEL_TOKEN)"
    notify "[${RUN_ID}] BUILD START | mode=npm"
    cd "${FRONT_DIR}"
    log "Build directory: ${FRONT_DIR}"
    "${npm_cmd}" run build
  else
    log "Build started: vercel build --prod (prebuilt)"
    notify "[${RUN_ID}] BUILD START | mode=vercel_prebuilt"
    cd "${FRONT_DIR}"
    log "Build directory: ${FRONT_DIR}"
    npx --yes vercel build --prod --token="${VERCEL_TOKEN}" --yes
  fi
  log "Build completed"
  notify "[${RUN_ID}] BUILD DONE"
}

deploy_to_vercel() {
  if [[ -z "${VERCEL_TOKEN:-}" ]]; then
    log "VERCEL_TOKEN not set, skipping Vercel deploy"
    return 0
  fi
  log "Vercel 배포 시작 (prebuilt)"
  notify "[${RUN_ID}] VERCEL DEPLOY START | mode=prebuilt"
  cd "${FRONT_DIR}"
  if npx --yes vercel deploy --prebuilt --prod --token="${VERCEL_TOKEN}" --yes; then
    log "Vercel 배포 완료"
    notify "[${RUN_ID}] VERCEL DEPLOY DONE"
  else
    log "Vercel 배포 실패"
    notify "[${RUN_ID}] VERCEL DEPLOY FAIL"
    return 1
  fi
}
