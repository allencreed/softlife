export async function GET() {
  const body = `User-agent: *\nAllow: /\n\nSitemap: https://lovesoftlife.com/sitemap.xml`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
