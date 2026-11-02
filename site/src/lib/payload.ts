import { getPayload } from 'payload'
import config from '@/payload.config'

/** Client Payload (API locale, sans HTTP). Mis en cache par Payload lui-même. */
export async function getPayloadClient() {
  return getPayload({ config })
}
