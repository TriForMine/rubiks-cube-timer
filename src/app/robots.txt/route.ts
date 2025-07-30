export const dynamic = "force-static";

export async function GET(): Promise<Response> {
	const baseUrl = "https://rubikscubetimer.triformine.dev";

	const robotsTxt = `User-agent: *
Allow: /

# Allow access to PWA resources
Allow: /manifest.json
Allow: /sw.js
Allow: /workbox-*.js
Allow: /icons/
Allow: /screenshots/

# Disallow development and build files
Disallow: /_next/static/chunks/
Disallow: /api/
Disallow: /*.json$

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional, be respectful to search engines)
Crawl-delay: 1`;

	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
