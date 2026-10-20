import path from "node:path";
import { loadSite } from "./load-site";

export function loadCurrentSite() {
  const siteId = process.env.SITE_ID ?? "现代极简零售";
  const rootDir = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : undefined;
  return loadSite(siteId, rootDir);
}
