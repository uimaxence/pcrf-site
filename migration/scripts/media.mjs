// Étape 3 : télécharge les médias originaux listés par parse.mjs (reprise possible, 1 req/s).
import fs from 'node:fs';
import path from 'node:path';
import { BASE, DIRS, sleep, DELAY_MS, fetchRetry, log, readJson, writeJson } from './lib.mjs';

const list = readJson(path.join(DIRS.out, 'media-list.json'), []);
const resultsFile = path.join(DIRS.out, 'media-results.json');
const results = readJson(resultsFile, {});
log('media.log', `start: ${list.length} médias`);

async function download(rel, dest) {
  const res = await fetchRetry(BASE + rel);
  if (res.status !== 200) return { status: res.status };
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return { status: 200, bytes: buf.length, contentType: res.headers.get('content-type') };
}

let i = 0, ok = 0, fb = 0, miss = 0, skip = 0;
for (const m of list) {
  i++;
  if (results[m.path]?.status === 200 || results[m.path]?.fallbackStatus === 200 || results[m.path]?.savedAs) { skip++; continue; }
  const dest = path.join(DIRS.media, m.path);
  try {
    let r = await download(m.path, dest);
    results[m.path] = { ...r, from: m.from };
    // Autres emplacements possibles de l'original
    for (const alt of m.alternates || []) {
      if (r.status === 200) break;
      await sleep(DELAY_MS);
      r = await download(alt, path.join(DIRS.media, alt));
      if (r.status === 200) results[m.path] = { ...r, from: m.from, savedAs: alt };
    }
    if (r.status === 200) ok++;
    else if (m.fallback) {
      await sleep(DELAY_MS);
      const fdest = path.join(DIRS.media, m.fallback);
      const r2 = await download(m.fallback, fdest);
      results[m.path].fallback = m.fallback; results[m.path].fallbackStatus = r2.status;
      if (r2.status === 200) fb++; else miss++;
    } else miss++;
  } catch (e) {
    results[m.path] = { status: 'error', error: String(e), from: m.from }; miss++;
    log('media.log', `ERROR ${m.path} ${e}`);
  }
  if (i % 100 === 0) { writeJson(resultsFile, results); log('media.log', `progress ${i}/${list.length} (ok ${ok}, secours ${fb}, manquant ${miss}, déjà ${skip})`); }
  await sleep(DELAY_MS);
}
writeJson(resultsFile, results);
const total = Object.values(results).reduce((s, r) => s + (r.bytes || 0), 0);
log('media.log', `done: ok ${ok}, secours ${fb}, manquant ${miss}, déjà ${skip}, ${(total / 1e6).toFixed(1)} Mo`);
