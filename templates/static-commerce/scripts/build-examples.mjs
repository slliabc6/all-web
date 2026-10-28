import { buildSite } from "./build-site.mjs";
import { exampleSites } from "./example-sites.mjs";

for (const site of exampleSites) {
  const result = await buildSite(site);
  console.log(`${result.siteDirectory}: ${result.outputPath}`);
}
