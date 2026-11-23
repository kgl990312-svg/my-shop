// Pretendard 글꼴 불러오기 (로딩 시간 R-24, 2026-11-23)
// - 첫 방문: 첫 화면을 기본 글꼴(맑은 고딕·애플 SD 고딕 등)로 먼저 그린 뒤, 페이지가 다 뜨고 한가해지면 Pretendard를 받아 바꿈
// - 다시 방문: 이미 받아 둔 글꼴이라 처음부터 바로 불러옴
// - 글꼴 파일: 공식 서브셋 (자주 쓰는 한글 2,350자 + 영문·기호, pretendard@1.3.9 woff2-subset)
import regular from '../assets/fonts/Pretendard-Regular.subset.woff2';
import semiBold from '../assets/fonts/Pretendard-SemiBold.subset.woff2';
import bold from '../assets/fonts/Pretendard-Bold.subset.woff2';
import extraBold from '../assets/fonts/Pretendard-ExtraBold.subset.woff2';

const FILES = [
  [regular, '400'],
  [semiBold, '600'],
  [bold, '700'],
  [extraBold, '800'],
];
const CACHED_KEY = 'moa-fonts-cached';
// Google 글꼴: Great Vibes(P01 배너 "Make it yours"), Cormorant Garamond·Gowun Batang(각인 세리프)
const GOOGLE_FONTS_CSS =
  'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@500;600&family=Gowun+Batang:wght@400;700&display=swap';

let loading = null;

/** Google 글꼴 CSS를 붙이고, CSS가 다 받아지면 끝남 */
function loadGoogleFonts() {
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_CSS;
    link.onload = resolve;
    link.onerror = resolve; // 못 받아도 기본 글꼴로 계속 보임
    document.head.appendChild(link);
  });
}

/** Pretendard 4개 굵기와 Google 글꼴을 불러옴. 여러 번 불러도 한 번만 받음 (이미지 저장 전에도 기다림) */
export function loadFonts() {
  if (loading) return loading;
  const google = loadGoogleFonts();
  if (typeof FontFace === 'undefined' || !document.fonts) {
    loading = google;
    return loading;
  }
  loading = Promise.all([
    google,
    ...FILES.map(([url, weight]) => {
      const face = new FontFace('Pretendard', `url(${url}) format('woff2')`, { weight, display: 'swap' });
      document.fonts.add(face);
      return face.load();
    }),
  ])
    .then(() => {
      try {
        localStorage.setItem(CACHED_KEY, '1');
      } catch {
        // 저장소를 못 써도 글꼴은 그대로 보임
      }
    })
    .catch(() => {
      // 글꼴을 못 받으면 기본 글꼴로 계속 보임
    });
  return loading;
}

/** 앱 시작 때 부름: 다시 방문이면 바로, 첫 방문이면 페이지가 다 뜬 뒤 한가할 때 불러옴 */
export function scheduleFonts() {
  let cached = false;
  try {
    cached = localStorage.getItem(CACHED_KEY) === '1';
  } catch {
    cached = false;
  }
  if (cached) {
    loadFonts();
    return;
  }
  // 첫 화면이 확실히 그려진 뒤에 받도록 페이지가 다 뜨고 1초 기다린 다음, 한가할 때 받음
  const whenIdle = () =>
    setTimeout(() => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => loadFonts(), { timeout: 2000 });
      else loadFonts();
    }, 1000);
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
