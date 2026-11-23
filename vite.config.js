import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 로딩 시간(R-24): P01 배너 사진(main-*.jpg)을 JS가 화면을 그리기 전부터 받도록 index.html에 미리 불러오기를 넣음
function preloadBannerImage() {
  return {
    name: 'preload-banner-image',
    apply: 'build',
    transformIndexHtml(html, ctx) {
      const file = Object.keys(ctx.bundle || {}).find((f) => /(^|\/)main-[\w-]+\.jpg$/.test(f));
      if (!file) return html;
      return [
        {
          tag: 'link',
          attrs: { rel: 'preload', as: 'image', href: `/my-shop/${file}`, fetchpriority: 'high' },
          injectTo: 'head',
        },
      ];
    },
  };
}

export default defineConfig({
  // GitHub Pages 주소: https://<사용자>.github.io/my-shop/
  base: '/my-shop/',
  plugins: [react(), preloadBannerImage()],
});
