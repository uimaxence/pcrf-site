'use server'

import { getPayloadClient } from '@/lib/payload'

export type ContactState = { ok: boolean; message: string }

const recent = new Map<string, number[]>()
function tooMany(key: string) {
  const now = Date.now()
  const list = (recent.get(key) || []).filter((t) => now - t < 10 * 60 * 1000)
  list.push(now)
  recent.set(key, list)
  return list.length > 5
}

/** Envoie le message du formulaire de contact à l'adresse configurée dans les réglages du site. */
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get('name') || '').trim().slice(0, 120)
  const email = String(formData.get('email') || '').trim().slice(0, 200)
  const subject = String(formData.get('subject') || '').trim().slice(0, 200)
  const message = String(formData.get('message') || '').trim().slice(0, 5000)
  const honeypot = String(formData.get('website') || '')
  if (honeypot) return { ok: true, message: 'Merci, votre message a été envoyé.' }
  if (!name || !email || !message) return { ok: false, message: 'Merci de remplir votre nom, votre adresse mail et votre message.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: 'L’adresse mail ne semble pas valide.' }
  if (tooMany(email)) return { ok: false, message: 'Trop de messages envoyés. Réessayez dans quelques minutes.' }

  const payload = await getPayloadClient()
  const site = await payload.findGlobal({ slug: 'site', depth: 0 })
  const to = site.contactEmail
  if (!to) return { ok: false, message: 'Le formulaire n’est pas encore configuré. Écrivez-nous par mail.' }
  try {
    await payload.sendEmail({
      to,
      replyTo: email,
      subject: `[Site] ${subject || 'Message depuis le formulaire de contact'}`,
      text: `De : ${name} <${email}>\n\n${message}`,
    })
    return { ok: true, message: 'Merci, votre message a été envoyé. Nous vous répondrons à l’adresse indiquée.' }
  } catch (e) {
    console.error('contact: envoi impossible', e)
    return { ok: false, message: 'L’envoi a échoué. Réessayez plus tard ou écrivez-nous directement par mail.' }
  }
}
