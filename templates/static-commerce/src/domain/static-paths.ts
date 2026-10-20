import path from "node:path";

function splitSuffix(value: string) {
  const match = value.match(/^([^?#]*)([?#].*)?$/);
  return { pathname: match?.[1] ?? value, suffix: match?.[2] ?? "" };
}

function routeToFile(pathname: string) {
  if (pathname === "/") return "index.html";
  const withoutSlash = pathname.replace(/^\//, "");
  if (path.posix.extname(withoutSlash)) return withoutSlash;
  return `${withoutSlash}.html`;
}

export function rewriteStaticReferences(html: string, pagePath: string): string {
  const pageDirectory = path.posix.dirname(pagePath.replaceAll("\\", "/"));
  return html.replace(/\b(href|src)=(['"])(\/[^/'"][^'"]*|\/)(\2)/g, (full, attribute, quote, value) => {
    if (value.startsWith("//")) return full;
    const { pathname, suffix } = splitSuffix(value);
    const target = routeToFile(pathname);
    const relative = path.posix.relative(pageDirectory === "." ? "" : pageDirectory, target) || path.posix.basename(target);
    return `${attribute}=${quote}${relative}${suffix}${quote}`;
  });
}
