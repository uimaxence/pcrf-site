'use client'

import { useActionState } from 'react'
import { sendJoin, type JoinState } from './actions'

const initial: JoinState = { ok: false, message: '' }

/** Formulaire « Nous rejoindre » : le formulaire de contact, plus la ville, le téléphone, le travail, la rencontre et les motivations. */
export function JoinForm() {
  const [state, action, pending] = useActionState(sendJoin, initial)
  if (state.ok) {
    return (
      <p className="form__ok" role="status">
        {state.message}
      </p>
    )
  }
  return (
    <form action={action} className="form form--join">
      <div className="form__grid">
        <div className="form__row">
          <label htmlFor="j-name">Ton nom</label>
          <input id="j-name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="form__row">
          <label htmlFor="j-email">Ton adresse mail</label>
          <input id="j-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="form__row">
          <label htmlFor="j-city">Ta ville d’habitation</label>
          <input id="j-city" name="city" type="text" required autoComplete="address-level2" />
        </div>
        <div className="form__row">
          <label htmlFor="j-phone">
            Ton numéro de téléphone <span className="form__hint">(facultatif)</span>
          </label>
          <input id="j-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
      </div>
      <div className="form__row">
        <label htmlFor="j-job">
          Ton travail <span className="form__hint">(profession, études, retraite, recherche d’emploi… facultatif)</span>
        </label>
        <input id="j-job" name="job" type="text" autoComplete="organization-title" />
      </div>
      <div className="form__row">
        <label htmlFor="j-how">Comment nous as-tu connus ?</label>
        <textarea id="j-how" name="how" rows={2} />
      </div>
      <div className="form__row">
        <label htmlFor="j-why">Tes motivations</label>
        <textarea id="j-why" name="why" rows={7} required />
      </div>
      <div className="form__hp" aria-hidden="true">
        <label htmlFor="j-website">Site web</label>
        <input id="j-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && (
        <p className="form__error" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn btn--red" type="submit" disabled={pending}>
        {pending ? 'Envoi…' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
