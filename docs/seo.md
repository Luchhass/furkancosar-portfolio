# SEO, discovery and installable portfolio

## Production model

- The canonical origin is `https://www.furkancosar.com`. The apex domain currently redirects there. Keep that redirect permanent and preserve paths and query strings if the host changes.
- Four pages have independent English and Turkish documents. Each canonical points to itself. Each pair links both ways with `en`, `tr` and `x-default` in HTML and in the XML sitemap. The hamburger menu includes the locale switch.
- `src/lib/seo.js` is the catalog for titles, descriptions, locale relationships, social metadata and structured data. The graph identifies the same person and website across both languages and describes the source-backed case study available from the footer. Add `sameAs` links only for confirmed profiles.
- `/sitemap.xml` inventories the eight intended HTML URLs. Add `lastmod` only when a reliable, page-specific content revision date can be maintained. Preview builds set `noindex` and publish an empty sitemap. On public non-Vercel staging, set `SEO_NOINDEX=true` before building.
- `/robots.txt` allows public pages and their resources. AI search crawlers can find the original HTML pages. `/llms.txt` is an optional bilingual directory of canonical URLs and the source repository. The default access policy for training crawlers is inherited from the existing wildcard rule. Check any CDN or WAF policies separately.
- The project archive displays interface concepts. Publish new case studies with a real brief, implementation details, screenshots of the actual work, and confirmed links to a demo or source. Add the page to the catalog only when it is publicly useful.

## Brand assets and PWA

`public/brand/favicons` contains the vector master output and PNG variants. `public/brand/social/{en,tr}` contains the eight 1200×630 JPEG share cards used by Open Graph and X. `public/brand/pwa` contains separate general-purpose and maskable app icons and actual mobile and desktop screenshots. The root favicon and Apple touch icon preserve conventional discovery paths. Historical root assets and the previous social URLs remain available for links already in circulation.

Run `npm run build:og` after changing brand artwork, social headings or routes. Run `npm run build:pwa-screens` against a running local site to refresh the screenshots. Set `TEST_URL` to target a production build when taking release screenshots. Commit the generated assets. The scripts use installed Google Chrome.

The app can be installed from compatible browsers. The service worker stores a self-contained offline fallback only. Online routes use the normal network response, and contact submissions are never queued or cached. Increment the worker cache version if the offline document changes.

## Search Console and Bing

1. Confirm the `furkancosar.com` Domain property in [Google Search Console](https://search.google.com/search-console). A Google verification TXT record already exists at the apex. Confirm the signed-in account owns or has access to the property. For the `https://www.furkancosar.com` URL-prefix property, the HTML tag method also works. Set `GOOGLE_SITE_VERIFICATION` to the tag’s **content** value before building production.
2. Add or import the site into [Bing Webmaster Tools](https://www.bing.com/webmasters). For Bing HTML tag verification, set `BING_SITE_VERIFICATION` to the content of the `msvalidate.01` tag before the production build.
3. After deployment, submit `https://www.furkancosar.com/sitemap.xml` in both dashboards. Inspect the live English and Turkish home pages, About and Projects. Confirm the user-declared and Google-selected canonical agree once crawled.
4. Use Search Console’s Performance report to follow branded variants (`furkan cosar`, `furkan coşar`) and role/location queries (`frontend developer`, `frontend developer istanbul`, `istanbul frontend geliştirici`). Track impressions, clicks and CTR by query and page. Use the Core Web Vitals report for real-user LCP, INP and CLS once field data is available.

### Optional IndexNow notifications

Generate one key with `npm run seo:indexnow -- --generate-key`. Set `INDEXNOW_KEY` to that value in production and for the local command. After redeployment, the site serves the UTF-8 key at `/<key>.txt`. Preview the canonical paths with `npm run seo:indexnow -- /projects /tr/projects`. To submit, append `--send`. The script checks the live key, sitemap and page responses before notifying IndexNow. Send only URLs with meaningful published updates. Google Search Console sitemap submission is separate.

## Release checks

Run `npm run lint`, `npm run build`, `npm run start -- --port 3002`, then `npm run test:seo` in a second terminal. The browser test checks initial HTML with JavaScript disabled, metadata and schema, image dimensions, the sitemap, language navigation and PWA installation and offline recovery. After rollout check live Google URL Inspection, [Rich Results Test](https://search.google.com/test/rich-results) and [PageSpeed Insights](https://pagespeed.web.dev/).

### References

- Google [Search Essentials](https://developers.google.com/search/docs/essentials), [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [profile pages](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [site names](https://developers.google.com/search/docs/appearance/site-names), [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search), [AI features](https://developers.google.com/search/docs/appearance/ai-features) and [verification](https://support.google.com/webmasters/answer/9008080).
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Open Graph protocol](https://ogp.me/) and [maskable icons](https://web.dev/articles/maskable-icon).
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [Claude crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers), [llms.txt proposal](https://llmstxt.org/) and [IndexNow protocol](https://www.indexnow.org/documentation).
