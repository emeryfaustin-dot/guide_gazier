import CarteRestaurant from './CarteRestaurant.jsx'

// Vue Liste : les restaurants filtrés, triés par note puis par nom.
export default function ListeRestaurants({ restaurants, plafonds, stats, favoris }) {
  const tries = [...restaurants].sort(
    (a, b) => (stats[b.id]?.moyenne ?? 0) - (stats[a.id]?.moyenne ?? 0) || a.nom.localeCompare(b.nom),
  )

  if (!tries.length) {
    return <p className="p-6 text-center text-gray-700">Aucun restaurant ne correspond à ta recherche.</p>
  }

  return (
    <ul className="mx-auto grid max-w-5xl gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
      {tries.map((r) => (
        <li key={r.id}>
          <CarteRestaurant restaurant={r} plafonds={plafonds} stats={stats[r.id]} estFavori={favoris.has(r.id)} />
        </li>
      ))}
    </ul>
  )
}
