import { useState } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';

type RaceSearchProps = {
  races: RaceSummary[];
};

export default function RaceSearch({ races }: RaceSearchProps) {
  const [query, setQuery] = useState('');

  const results = races.filter((race) => {
    const term = query.trim().toLocaleLowerCase('es');
    if (!term) return false;

    return (
      (race.name ?? '').toLocaleLowerCase('es').includes(term) ||
      (race.city ?? '').toLocaleLowerCase('es').includes(term) ||
      (race.province ?? '').toLocaleLowerCase('es').includes(term)
    );
  });

  return (
    <div className="header-search">
      <div className="search-box">
        <svg
          className="search-box__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="search-box__input"
          placeholder="Buscar carrera, ciudad..."
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

      {/* Lista de resultados estéticos */}
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
                      {race.city} · {race.province}
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
              <p>No se encontraron carreras para "<strong>{query}</strong>"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}