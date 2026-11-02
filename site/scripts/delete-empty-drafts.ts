/** Supprime les brouillons d'articles sans titre (créés en ouvrant puis quittant le formulaire). Lancer : pnpm cleanup:drafts */
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config })
  console.log('connecté')
  const found = await payload.find({ collection: 'articles', depth: 0, limit: 100, where: { _status: { equals: 'draft' } }, draft: true })
  const empty = found.docs.filter((d) => !d.title || !d.title.trim())
  for (const d of empty) await payload.delete({ collection: 'articles', id: d.id, context: { skipRevalidate: true } })
  console.log(`brouillons vides supprimés : ${empty.length}`)
  process.exit(0)
}
await main().catch((e) => { console.error(e); process.exit(1) })
