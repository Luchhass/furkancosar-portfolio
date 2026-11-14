export const PAGE_PATHS = ["/", "/about", "/projects", "/contact"];
export function basePath(pathname = "/") {
  const path = (pathname || "/").replace(/^\/tr(?=\/|$)/, "") || "/";
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}
export function routeLocale(pathname = "/") { return /^\/tr(?:\/|$)/.test(pathname) ? "tr" : "en"; }
export function localizedPath(pathname, locale) {
  const path = basePath(pathname);
  if (!PAGE_PATHS.includes(path)) return pathname;
  return locale === "tr" ? `/tr${path === "/" ? "" : path}` : path;
}
