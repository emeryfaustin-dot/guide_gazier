// Encadré d'information / d'alerte réutilisable.
const COULEURS = {
  info: 'border-blue-300 bg-blue-50 text-blue-950',
  succes: 'border-green-300 bg-green-50 text-green-950',
  alerte: 'border-amber-300 bg-amber-50 text-amber-950',
  erreur: 'border-red-300 bg-red-50 text-red-950',
}

export default function Message({ type = 'info', children }) {
  return (
    <div role={type === 'erreur' ? 'alert' : undefined} className={`rounded-lg border px-4 py-3 ${COULEURS[type]}`}>
      {children}
    </div>
  )
}
