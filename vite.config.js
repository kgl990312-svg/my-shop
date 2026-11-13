import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages 주소: https://<사용자>.github.io/my-shop/
  base: '/my-shop/',
  plugins: [react()],
});
