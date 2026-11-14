// Anciennes adresses SPIP (spip.php?article123, spip.php?rubrique5&debut_articles=40…)
// → fichiers de la copie figée (spip.php@article123.html, spip.php@rubrique5_debut_articles=40.html).
export const config = { matcher: '/spip.php' }

export default function middleware(request) {
  const url = new URL(request.url)
  const query = url.search.slice(1)
  if (!query || /page=(login|recherche|backend|identifiants|spip_pass)/.test(query)) {
    return Response.redirect(new URL('/', url), 308)
  }
  const target = `/spip.php@${query.replace(/&/g, '_')}.html`
  return Response.redirect(new URL(target, url), 308)
}
