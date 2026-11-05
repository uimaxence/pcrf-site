import embleme from '@/assets/embleme.png'

/** Petit emblème en haut du menu de l'administration. */
export function Icon() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="pcrf-icon" src={embleme.src} alt="PCRF" width={24} height={24} />
}
