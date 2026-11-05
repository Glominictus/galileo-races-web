import { useMemo, useState, useEffect } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';
import { matchesQuery } from '@/lib/domain/races/filters';

type RaceSearchProps = {
  races: RaceSummary[];
  isCatalogPage?: boolean;
};

export default function RaceSearch({ races, isCatalogPage = false }: RaceSearchProps) {
  const [query, setQuery] = useState('');
  const [onCatalog, setOnCatalog] = useState(isCatalogPage);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isCat = window.location.pathname === '/carreras' || window.location.pathname === '/carreras/';
    setOnCatalog(isCat);

    // Inicializar el input si ya hay una búsqueda en los parámetros de la URL
    if (isCat) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('query');
      if (q) setQuery(q);
    }

    // Escuchar si desde la página de catálogo se borra o cambia la búsqueda
    const handleCatalogReset = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      if (customEvent.detail && typeof customEvent.detail.query === 'string') {
        setQuery(customEvent.detail.query);
      } else {
        setQuery('');
      }
    };

    window.addEventListener('pulso:catalog-query-change', handleCatalogReset);
    return () => {
      window.removeEventListener('pulso:catalog-query-change', handleCatalogReset);
    };
  }, []);

  const results = useMemo(() => {
    const term = query.trim();
    if (!term || onCatalog) return [];
    return races.filter((race) => matchesQuery(race, term));
  }, [races, query, onCatalog]);

  const handleInputChange = (val: string) => {
    setQuery(val);

    if (onCatalog) {
      // 1. Notificar en tiempo real al catálogo para filtrar las tarjetas
      window.dispatchEvent(
        new CustomEvent('pulso:search', {
          detail: { query: val },
        })
      );

      // 2. Sincronizar URL sin recargar la página
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (val.trim()) {
          url.searchParams.set('query', val.trim());
        } else {
          url.searchParams.delete('query');
        }
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const handleClear = () => {
    handleInputChange('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!onCatalog && query.trim()) {
      window.location.href = `/carreras?query=${encodeURIComponent(query.trim())}`;
    }
  };

  const placeholder = onCatalog
    ? 'Filtrar carreras por nombre o concello…'
    : 'Buscar carrera, ciudad, distancia…';

  return (
    <div className="header-search">
      <form className="search-box" onSubmit={handleSubmit} role="search">
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
          placeholder={placeholder}
          aria-label={onCatalog ? 'Filtrar catálogo de carreras' : 'Buscar carrera'}
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
        />

        {query && (
          <button
            type="button"
            className="search-box__clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
            title="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </form>

      {!onCatalog && query.trim() && (
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
