import { buildSite } from "./build-site.mjs";

const sites = ["现代极简零售", "自然生活批发", "深色精品混合"];
for (const site of sites) {
  const result = await buildSite(site);
  console.log(`${result.siteDirectory}: ${result.outputPath}`);
}
