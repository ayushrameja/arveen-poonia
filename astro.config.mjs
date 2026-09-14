import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

const { SITE_URL } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
  site: SITE_URL || undefined,
  output: 'static',
  trailingSlash: 'always',
  integrations: SITE_URL ? [sitemap()] : [],
  vite: { plugins: [tailwindcss()] },
  devToolbar: { enabled: false },
});
