import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { rewriteStaticCssReferences, rewriteStaticReferences } from "../src/domain/static-paths.ts";

const projectRoot = process.cwd();
const exportsRoot = path.join(projectRoot, "exports");

function run(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const npmCli = command === "npm" ? process.env.npm_execpath : undefined;
    const executable = npmCli ? process.execPath : command;
    const commandArgs = npmCli ? [npmCli, ...args] : args;
    const child = spawn(executable, commandArgs, {
      cwd: projectRoot,
      env: { ...process.env, ...env },
      stdio: "inherit",
      shell: process.platform === "win32" && command === "npm" && !npmCli
    });
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)));
    child.on("error", reject);
  });
}

async function filesUnder(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(fullPath));
    else output.push(fullPath);
  }
  return output;
}

async function inlineModuleScripts(html, outputRoot) {
  const pattern = /<script\s+type="module"\s+src="(\/[^"?]+)"\s*><\/script>/g;
  const matches = [...html.matchAll(pattern)];
  let result = html;
  for (const match of matches) {
    const sourcePath = path.resolve(outputRoot, match[1].slice(1));
    if (!sourcePath.startsWith(path.resolve(outputRoot) + path.sep)) throw new Error(`Unsafe script path ${match[1]}`);
    const source = (await readFile(sourcePath, "utf8")).replaceAll("</script", "<\\/script");
    result = result.replace(match[0], `<script type="module">${source}</script>`);
  }
  return result;
}

async function prepareStaticOutput(outputRoot) {
  const outputFiles = await filesUnder(outputRoot);
  const htmlFiles = outputFiles.filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) {
    const pagePath = path.relative(outputRoot, file).replaceAll("\\", "/");
    let html = await readFile(file, "utf8");
    html = await inlineModuleScripts(html, outputRoot);
    html = rewriteStaticReferences(html, pagePath);
    html = rewriteStaticCssReferences(html, pagePath);
    await writeFile(file, html, "utf8");
  }
  const cssFiles = outputFiles.filter((file) => file.endsWith(".css"));
  for (const file of cssFiles) {
    const cssPath = path.relative(outputRoot, file).replaceAll("\\", "/");
    const css = rewriteStaticCssReferences(await readFile(file, "utf8"), cssPath);
    await writeFile(file, css, "utf8");
  }
}

export async function buildSite(siteDirectory) {
  if (!siteDirectory) throw new Error("buildSite requires a site directory");
  const sitePath = path.join(projectRoot, "sites", siteDirectory, "site.json");
  const site = JSON.parse(await readFile(sitePath, "utf8"));
  await run("npm", ["run", "build"], { SITE_ID: siteDirectory, SITE_ROOT: projectRoot });

  const dist = path.join(projectRoot, "dist");
  const sourceAssets = path.join(projectRoot, "data", "catalogs", site.catalogId, "assets");
  await mkdir(path.join(dist, "catalog-assets"), { recursive: true });
  await cp(sourceAssets, path.join(dist, "catalog-assets", "assets"), { recursive: true });

  const target = path.join(exportsRoot, siteDirectory, "网站成品");
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(path.resolve(exportsRoot) + path.sep)) throw new Error(`Unsafe export target ${target}`);
  await rm(target, { recursive: true, force: true });
  await mkdir(path.dirname(target), { recursive: true });
  await cp(dist, target, { recursive: true });
  await prepareStaticOutput(target);
  return { siteDirectory, siteId: site.id, outputPath: target };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await buildSite(process.argv[2]);
  console.log(JSON.stringify(result));
}
