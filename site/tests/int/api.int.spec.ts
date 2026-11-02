import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Contenu', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('les rubriques principales existent', async () => {
    const res = await payload.find({ collection: 'rubriques', where: { slug: { in: ['france', 'international', 'luttes'] } } })
    expect(res.totalDocs).toBe(3)
  })

  it('les articles publiés ont une rubrique et une date', async () => {
    const res = await payload.find({ collection: 'articles', limit: 20, depth: 0, where: { _status: { equals: 'published' } } })
    expect(res.docs.length).toBeGreaterThan(0)
    for (const a of res.docs) {
      expect(a.rubrique).toBeTruthy()
      expect(a.date).toBeTruthy()
      expect(a.slug).toBeTruthy()
    }
  })

  it('le public ne voit pas les brouillons', async () => {
    const res = await payload.find({ collection: 'articles', overrideAccess: false, where: { _status: { equals: 'draft' } } })
    expect(res.totalDocs).toBe(0)
  })
})
