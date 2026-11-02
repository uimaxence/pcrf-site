import type { Access, FieldAccess } from 'payload'

export const anyone: Access = () => true
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'
export const isAdminField: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

/** Le public ne voit que les contenus publiés ; les rédacteurs connectés voient aussi les brouillons. */
export const publishedOrLoggedIn: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
