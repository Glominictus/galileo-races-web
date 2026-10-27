import { useMemo, useState } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';
import { matchesQuery } from '@/lib/domain/races/filters';

type RaceSearchProps = {
  races: RaceSummary[];
};

export default function RaceSearch({ races }: RaceSearchProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const term = query.trim();
    if (!term) return [];
    return races.filter((race) => matchesQuery(race, term));
  }, [races, query]);

  return (
    <div className="header-search">
      <div className="search-box">
        <svg
          className="search-box__icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>

        <input
          type="text"
          className="search-box__input"
          placeholder="Buscar carrera, ciudad, distancia..."
          aria-label="Buscar carrera"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {query && (
          <button
            type="button"
            className="search-box__clear"
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="search-results">
          {results.length > 0 ? (
            <div className="search-results__list">
              {results.map((race) => (
                <a
                  key={race.id}
                  href={`/carreras/${race.slug}`}
                  className="search-card"
                >
                  <div className="search-card__body">
                    <span className="search-card__title">{race.name}</span>
                    <span className="search-card__location">
                      {race.city} · {race.province} {race.distanceLabel && `· ${race.distanceLabel}`}
                    </span>
                  </div>
                  <div className="search-card__action">
                    <span className="search-card__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="search-empty">
              <span>0 resultados</span>
              <p>
                No se encontraron carreras para "<strong>{query}</strong>"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
