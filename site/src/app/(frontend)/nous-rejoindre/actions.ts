'use server'

import { field, tooMany, validEmail } from '@/lib/forms'
import { getPayloadClient } from '@/lib/payload'

export type JoinState = { ok: boolean; message: string }

const THANKS = 'Merci ! Ta demande a bien été envoyée. Un camarade te recontacte rapidement à l’adresse indiquée.'

/** Envoie une demande « Nous rejoindre » à l'adresse prévue dans les réglages du site (sinon l'adresse de contact). */
export async function sendJoin(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const name = field(formData, 'name', 120)
  const email = field(formData, 'email', 200)
  const city = field(formData, 'city', 120)
  const phone = field(formData, 'phone', 40)
  const job = field(formData, 'job', 160)
  const how = field(formData, 'how', 1000)
  const why = field(formData, 'why', 5000)
  const honeypot = String(formData.get('website') || '')
  if (honeypot) return { ok: true, message: THANKS }
  if (!name || !email || !city || !why) return { ok: false, message: 'Merci de remplir ton nom, ton adresse mail, ta ville et tes motivations.' }
  if (!validEmail(email)) return { ok: false, message: 'L’adresse mail ne semble pas valide.' }
  if (tooMany(email)) return { ok: false, message: 'Trop de demandes envoyées. Réessaie dans quelques minutes.' }

  const payload = await getPayloadClient()
  const site = await payload.findGlobal({ slug: 'site', depth: 0 })
  const to = site.joinEmail || site.contactEmail
  if (!to) return { ok: false, message: 'Le formulaire n’est pas encore configuré. Écris-nous par mail.' }
  const text = [
    `Nom : ${name}`,
    `Mail : ${email}`,
    `Ville : ${city}`,
    `Téléphone : ${phone || '(non précisé)'}`,
    `Travail : ${job || '(non précisé)'}`,
    '',
    'Comment nous a connus :',
    how || '(non précisé)',
    '',
    'Motivations :',
    why,
  ].join('\n')
  try {
    await payload.sendEmail({ to, replyTo: email, subject: `[Site] Demande pour rejoindre le PCRF : ${name} (${city})`, text })
    return { ok: true, message: THANKS }
  } catch (e) {
    console.error('nous-rejoindre: envoi impossible', e)
    return { ok: false, message: 'L’envoi a échoué. Réessaie plus tard ou écris-nous directement par mail.' }
  }
}
