import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASE = 'https://www.pcrf-ic.fr/';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIRS = {
  raw: path.join(ROOT, 'raw'),
  out: path.join(ROOT, 'out'),
  media: path.join(ROOT, 'media'),
  logs: path.join(ROOT, 'logs'),
};
for (const d of Object.values(DIRS)) fs.mkdirSync(d, { recursive: true });

// robots.txt du site demande Crawl-delay: 1
export const UA = 'PCRF-site-migration/1.0 (refonte du site pcrf-ic.fr; 1 requete par seconde)';
export const DELAY_MS = Number(process.env.DELAY_MS ?? 1000);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function log(file, line) {
  const msg = `${new Date().toISOString()} ${line}`;
  console.log(msg);
  fs.appendFileSync(path.join(DIRS.logs, file), msg + '\n');
}

export async function fetchRetry(url, { method = 'GET', tries = 4, timeoutMs = 30000, redirect = 'follow' } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        method,
        redirect,
        headers: { 'User-Agent': UA, 'Accept-Language': 'fr' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(DELAY_MS * (i + 1) * 5);
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      await sleep(DELAY_MS * (i + 1) * 5);
    }
  }
  throw lastErr;
}

// "https://www.pcrf-ic.fr/Pour-l-elargissement-des-luttes" -> "Pour-l-elargissement-des-luttes"
export function slugOf(url) {
  return decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ''));
}
export function rawPath(slug) {
  return path.join(DIRS.raw, slug.replace(/[^A-Za-z0-9._-]/g, '_') + '.html');
}
export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
export function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
