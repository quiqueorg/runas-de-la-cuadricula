import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** GitHub Pages project sites are served from /<repo>/. Local dev stays at /. */
function siteBase(): string {
  const pagesPath = process.env.PAGES_BASE_PATH?.trim().replace(/\/$/, '');
  return pagesPath ? `${pagesPath}/` : '/';
}

export default defineConfig({
  base: siteBase(),
  plugins: [react()],
  server: { port: 5173 },
});
