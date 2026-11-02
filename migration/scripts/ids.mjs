// Étape 4 : table id SPIP -> slug, via les redirections 301 de spip.php?articleN et spip.php?rubriqueN.
// Sert aux redirections des anciennes URLs et aux liens internes de type spip.php?article123.
import path from 'node:path';
import { BASE, DIRS, sleep, DELAY_MS, fetchRetry, log, readJson, writeJson } from './lib.mjs';

const MAX_ARTICLE = Number(process.env.MAX_ID ?? 1150);
const MAX_RUBRIQUE = Number(process.env.MAX_RUBRIQUE ?? 40);
const file = path.join(DIRS.out, 'ids.json');
const ids = readJson(file, { articles: {}, rubriques: {} });

async function resolve(kind, id) {
  const res = await fetchRetry(`${BASE}spip.php?${kind}${id}`, { redirect: 'manual' });
  if (res.status === 301 || res.status === 302) {
    const loc = res.headers.get('location') || '';
    // L'en-tête Location arrive en latin-1 côté Node : on le remet en UTF-8 avant décodage.
    const raw = Buffer.from(loc.replace(BASE, '').replace(/^\//, ''), 'latin1').toString('utf8');
    try { return decodeURIComponent(raw) || null; } catch { return raw || null; }
  }
  return null;
}

let n = 0;
for (const [kind, max] of [['article', MAX_ARTICLE], ['rubrique', MAX_RUBRIQUE]]) {
  const store = ids[kind + 's'];
  for (let id = 1; id <= max; id++) {
    if (id in store) continue;
    try { store[id] = await resolve(kind, id); }
    catch (e) { log('ids.log', `ERROR ${kind}${id} ${e}`); continue; }
    n++;
    if (n % 100 === 0) { writeJson(file, ids); log('ids.log', `progress ${kind} ${id}/${max}`); }
    await sleep(DELAY_MS);
  }
}
writeJson(file, ids);
const found = Object.values(ids.articles).filter(Boolean).length;
log('ids.log', `done: ${found} articles résolus sur ${MAX_ARTICLE} ids testés, ${Object.values(ids.rubriques).filter(Boolean).length} rubriques`);
