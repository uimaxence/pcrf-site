import logo from '@/assets/logo-pcrf.png'

/** Logo affiché sur la page de connexion de l'administration. */
export function Logo() {
  return (
    <div className="pcrf-brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.src} alt="Parti Communiste Révolutionnaire de France" width={logo.width} height={logo.height} />
      <p>Espace de rédaction</p>
    </div>
  )
}
