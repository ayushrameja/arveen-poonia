import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const content = site
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n`
    : 'User-agent: *\nDisallow: /\n';

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
