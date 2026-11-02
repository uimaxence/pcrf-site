// Étape 1 : télécharge le HTML brut de chaque page listée dans le sitemap (reprise possible).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, DIRS, sleep, DELAY_MS, fetchRetry, log, slugOf, rawPath, writeJson } from './lib.mjs';

const sitemapFile = path.join(DIRS.out, 'sitemap.xml');
let xml;
if (fs.existsSync(sitemapFile) && !process.argv.includes('--refresh')) {
  xml = fs.readFileSync(sitemapFile, 'utf8');
} else {
  const r = await fetchRetry(BASE + 'sitemap.xml');
  xml = await r.text();
  fs.writeFileSync(sitemapFile, xml);
  await sleep(DELAY_MS);
}
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
// Pages de l'ancien menu, absentes du sitemap mais encore en ligne
const extra = ['Qui-sommes-nous', 'Liens', '_Contact_', 'Congres-fondateur-du-Parti'].map((s) => BASE + s);
const all = [...new Set([...urls, ...extra])];
log('scrape.log', `start: ${all.length} urls`);

let done = 0, skipped = 0, failed = 0;
const failures = [];
for (const url of all) {
  const file = rawPath(slugOf(url));
  if (fs.existsSync(file) && fs.statSync(file).size > 0) { skipped++; continue; }
  try {
    const res = await fetchRetry(url);
    const html = await res.text();
    if (res.status !== 200) {
      failed++; failures.push({ url, status: res.status });
      log('scrape.log', `FAIL ${res.status} ${url}`);
    } else {
      fs.writeFileSync(file, html); done++;
    }
  } catch (e) {
    failed++; failures.push({ url, error: String(e) });
    log('scrape.log', `ERROR ${url} ${e}`);
  }
  if ((done + failed) % 50 === 0) log('scrape.log', `progress ${done + failed + skipped}/${all.length} (ok ${done}, skip ${skipped}, fail ${failed})`);
  await sleep(DELAY_MS);
}
writeJson(path.join(DIRS.out, 'scrape-failures.json'), failures);
log('scrape.log', `done: ok ${done}, skipped ${skipped}, failed ${failed}`);
