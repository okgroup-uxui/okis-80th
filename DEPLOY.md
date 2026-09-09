# 배포 절차

## 0. 먼저 토큰 폐기

대화에 평문으로 남은 PAT은 노출된 것으로 봐야 합니다.
https://github.com/settings/tokens → 해당 토큰 **Delete**

앞으로 로컬에서 푸시할 때는 토큰을 직접 다루지 않는 방법을 권합니다.

- **GitHub CLI**: `gh auth login` (브라우저로 인증, 토큰이 안전하게 보관됨)
- **SSH 키**: `ssh-keygen -t ed25519 -C "메모"` → `~/.ssh/id_ed25519.pub` 내용을
  https://github.com/settings/keys 에 등록
- **Git Credential Manager**: macOS/Windows 기본 자격증명 저장소 사용

---

## 1. 리포지토리 생성

https://github.com/new

- Repository name: `okis-80th` (원하는 이름)
- Public (GitHub Pages 무료 플랜은 public만 가능)
- **README, .gitignore, license 추가하지 마세요** — 이미 커밋에 들어있어 충돌합니다

## 2. 푸시

이 폴더에는 커밋 1개가 이미 만들어져 있습니다. 원격만 연결하면 됩니다.

```bash
cd okis-80th

# SSH (권장)
git remote add origin git@github.com:<USERNAME>/okis-80th.git

# 또는 HTTPS + gh CLI 인증
# git remote add origin https://github.com/<USERNAME>/okis-80th.git

git push -u origin main
```

`<USERNAME>`만 본인 계정으로 바꾸면 됩니다.

## 3. GitHub Pages 켜기

리포지토리 → **Settings** → 좌측 **Pages**

- Source: **Deploy from a branch**
- Branch: **main** / **/ (root)**
- Save

1~2분 후 아래 주소로 열립니다.

```
https://<USERNAME>.github.io/okis-80th/
```

빌드 과정이 없는 정적 파일이라 별도 워크플로가 필요하지 않습니다.
`.nojekyll`을 넣어뒀으니 Jekyll 처리 없이 파일이 그대로 서빙됩니다.

## 4. 확인할 것

- [ ] 모바일 실기기에서 페이지 단위 스냅이 의도대로 멈추는지
- [ ] Noto Sans KR 웹폰트가 로드되는지 (로드 실패 시 자폭이 달라져 줄바꿈이 밀립니다)
- [ ] "영수증 발급 링크 바로가기" 버튼 → 네이버 폼 연결
- [ ] `assets/` 이미지 22개 전부 표시 (대소문자 구분되는 서버이므로 파일명 변경 주의)

## 커스텀 도메인을 쓸 경우

Settings → Pages → Custom domain에 도메인 입력 후,
DNS에 `CNAME` 레코드로 `<USERNAME>.github.io` 지정.
설정하면 리포지토리 루트에 `CNAME` 파일이 자동 생성됩니다.

## 이후 수정 반영

```bash
git add -A
git commit -m "내용 수정"
git push
```

푸시하면 Pages가 자동으로 다시 배포합니다.
