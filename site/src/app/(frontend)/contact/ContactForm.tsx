'use client'

import { useActionState } from 'react'
import { sendContact, type ContactState } from './actions'

const initial: ContactState = { ok: false, message: '' }

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial)
  if (state.ok) {
    return (
      <p className="form__ok" role="status">
        {state.message}
      </p>
    )
  }
  return (
    <form action={action} className="form">
      <div className="form__row">
        <label htmlFor="c-name">Votre nom</label>
        <input id="c-name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="form__row">
        <label htmlFor="c-email">Votre adresse mail</label>
        <input id="c-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="form__row">
        <label htmlFor="c-subject">Sujet</label>
        <input id="c-subject" name="subject" type="text" />
      </div>
      <div className="form__row">
        <label htmlFor="c-message">Votre message</label>
        <textarea id="c-message" name="message" rows={7} required />
      </div>
      <div className="form__hp" aria-hidden="true">
        <label htmlFor="c-website">Site web</label>
        <input id="c-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && (
        <p className="form__error" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn btn--red" type="submit" disabled={pending}>
        {pending ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  )
}
