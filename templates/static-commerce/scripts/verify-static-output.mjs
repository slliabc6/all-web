import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { exampleSites } from "./example-sites.mjs";

const exportsRoot = path.resolve("exports");

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(fullPath));
    else output.push(fullPath);
  }
  return output;
}

async function verifyDirectory(directory) {
  const htmlFiles = (await filesUnder(directory)).filter((file) => file.endsWith(".html"));
  if (htmlFiles.length === 0) throw new Error(`${directory}: no HTML files`);
  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    if (/https?:\/\//i.test(html)) throw new Error(`${htmlFile}: external HTTP reference`);
    if (/\b(?:href|src)=["']\//.test(html)) throw new Error(`${htmlFile}: absolute internal reference`);
    for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
      const reference = match[1];
      if (/^(?:#|mailto:|tel:|data:|javascript:)/.test(reference)) continue;
      const clean = reference.split(/[?#]/)[0];
      if (!clean) continue;
      const target = path.resolve(path.dirname(htmlFile), clean);
      if (!target.startsWith(path.resolve(directory) + path.sep)) throw new Error(`${htmlFile}: reference escapes output: ${reference}`);
      await access(target).catch(() => { throw new Error(`${htmlFile}: missing ${reference}`); });
    }
  }
  return htmlFiles.length;
}

let total = 0;
for (const site of exampleSites) {
  const directory = path.join(exportsRoot, site, "网站成品");
  const count = await verifyDirectory(directory);
  total += count;
  console.log(`${site}: ${count} HTML files verified`);
}
console.log(`Verified ${total} static HTML files.`);
