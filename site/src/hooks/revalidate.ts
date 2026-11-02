import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook, PayloadRequest } from 'payload'

/** Purge le cache des pages publiques après une modification. Silencieux hors de Next (ex. script d'import). */
async function revalidateSite(req: PayloadRequest) {
  if (req.context?.skipRevalidate) return
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    /* hors contexte Next : rien à faire */
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}
export const revalidateAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}
export const revalidateGlobalAfterChange: GlobalAfterChangeHook = async ({ doc, req }) => {
  await revalidateSite(req)
  return doc
}
