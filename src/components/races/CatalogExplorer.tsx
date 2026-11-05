import { useMemo, useState, useEffect } from 'react';
import type { RaceSummary, RaceType } from '@/lib/race-portal/types';
import { filterRaces } from '@/lib/domain/races/filters';
import { matchesDistance } from '@/lib/domain/races/distances';
import RaceCard from './RaceCard';
import RaceRow from './RaceRow';

interface Props {
  initialRaces: RaceSummary[];
  provinces: string[];
}

const DISTANCE_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: '5', label: '5K' },
  { value: '10', label: '10K' },
  { value: '15', label: '15K' },
  { value: '21', label: '21K' },
  { value: '42', label: '42K' },
];

export default function CatalogExplorer({ initialRaces, provinces }: Props) {
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState<RaceType | ''>('');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [distance, setDistance] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('query');
    const pParam = params.get('province');
    const tParam = params.get('type') as RaceType | null;
    const dParam = params.get('distance');
    const openParam = params.get('onlyOpen');

    if (qParam) setQuery(qParam);
    if (pParam) setProvince(pParam);
    if (tParam) setType(tParam);
    if (dParam) setDistance(dParam);
    if (openParam === 'true') setOnlyOpen(true);

    try {
      const savedView = window.localStorage.getItem('pulso_catalog_view');
      if (savedView === 'list' || savedView === 'grid') {
        setViewMode(savedView);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      window.localStorage.setItem('pulso_catalog_view', mode);
    } catch {
      // ignore
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    syncUrlParam('query', val);
  };

  const syncUrlParam = (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set(key, value.trim());
    } else {
      url.searchParams.delete(key);
    }
    window.history.replaceState({}, '', url.toString());
  };

  // Cálculo dinámico del número de pruebas disponibles para cada modalidad
  const typeCounts = useMemo(() => {
    const base = initialRaces.filter((race) => {
      if (province && race.province !== province) return false;
      if (onlyOpen && race.status !== 'open') return false;
      if (distance && !matchesDistance(race.distanceLabel, distance)) return false;
      return true;
    });

    return {
      all: base.length,
      asfalto: base.filter((r) => r.type === 'asfalto').length,
      trail: base.filter((r) => r.type === 'trail').length,
      andaina: base.filter((r) => r.type === 'andaina').length,
    };
  }, [initialRaces, province, onlyOpen, distance]);

  const races = useMemo(
    () => filterRaces(initialRaces, { query, province, type, onlyOpen, distance }),
    [initialRaces, query, province, type, onlyOpen, distance]
  );

  const clear = () => {
    setQuery('');
    setProvince('');
    setType('');
    setOnlyOpen(false);
    setDistance('');

    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="catalog-app">
      {/* Panel de filtros interactivos fijado al hacer scroll */}
      <div className="catalog-sticky-bar">
        <div className="catalog-filters-panel">
          {/* Fila 1: Búsqueda rápida + Selector de provincia + Toggle solo abiertas */}
          <div className="catalog-filters-primary">
            {/* Campo de búsqueda textual */}
            <div className="catalog-input-group">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="Buscar por nombre o localidad…"
                aria-label="Buscar carrera o localidad"
              />
              {query && (
                <button
                  type="button"
                  className="catalog-input-clear"
                  onClick={() => handleQueryChange('')}
                  aria-label="Borrar búsqueda"
                  title="Borrar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de provincia */}
            <div className="catalog-select-group">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <select
                value={province}
                onChange={(event) => {
                  const val = event.target.value;
                  setProvince(val);
                  syncUrlParam('province', val);
                }}
                aria-label="Filtrar por provincia"
              >
                <option value="">Todas las provincias</option>
                {provinces.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Switch toggle para solo abiertas */}
            <label className="catalog-switch" title="Mostrar únicamente pruebas con inscripciones abiertas">
              <input
                type="checkbox"
                checked={onlyOpen}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setOnlyOpen(checked);
                  syncUrlParam('onlyOpen', checked ? 'true' : '');
                }}
              />
              <span className="catalog-switch__track" aria-hidden="true">
                <span className="catalog-switch__thumb"></span>
              </span>
              <span className="catalog-switch__label">
                <span className={`status-dot ${onlyOpen ? 'status-dot--active' : ''}`} aria-hidden="true"></span>
                Solo abiertas
              </span>
            </label>
          </div>

          {/* Fila 2: Chips interactivos de Terreno y Distancias */}
          <div className="catalog-chips-row">
            {/* Modalidad / Terreno */}
            <div className="chips-cluster" role="group" aria-label="Filtrar por terreno">
              <span className="chips-cluster__label">Terreno</span>
              <button
                type="button"
                className={`filter-chip ${type === '' ? 'filter-chip--active' : ''}`}
                onClick={() => {
                  setType('');
                  syncUrlParam('type', '');
                }}
              >
                <span>Todas</span>
                <span className="filter-chip__count">{typeCounts.all}</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${type === 'asfalto' ? 'filter-chip--active' : ''}`}
                onClick={() => {
                  const next = type === 'asfalto' ? '' : 'asfalto';
                  setType(next);
                  syncUrlParam('type', next);
                }}
              >
                <span>Asfalto</span>
                <span className="filter-chip__count">{typeCounts.asfalto}</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${type === 'trail' ? 'filter-chip--active' : ''}`}
                onClick={() => {
                  const next = type === 'trail' ? '' : 'trail';
                  setType(next);
                  syncUrlParam('type', next);
                }}
              >
                <span>Trail</span>
                <span className="filter-chip__count">{typeCounts.trail}</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${type === 'andaina' ? 'filter-chip--active' : ''}`}
                onClick={() => {
                  const next = type === 'andaina' ? '' : 'andaina';
                  setType(next);
                  syncUrlParam('type', next);
                }}
              >
                <span>Andaina</span>
                <span className="filter-chip__count">{typeCounts.andaina}</span>
              </button>
            </div>

            <span className="chips-separator" aria-hidden="true"></span>

            {/* Distancias */}
            <div className="chips-cluster" role="group" aria-label="Filtrar por distancia">
              <span className="chips-cluster__label">Distancia</span>
              {DISTANCE_OPTIONS.map((opt) => {
                const isActive = distance === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
                    onClick={() => {
                      const next = isActive ? '' : opt.value;
                      setDistance(next);
                      syncUrlParam('distance', next);
                    }}
                  >
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de resultados + Filtros activos + Selector de vista */}
      <div className="catalog-summary" aria-live="polite">
        <div className="catalog-summary__left">
          <p>
            <strong>{races.length}</strong> {races.length === 1 ? 'prueba encontrada' : 'pruebas encontradas'}
          </p>

          {/* Badges de filtros aplicados */}
          <div className="active-filters-list">
            {query && (
              <span className="active-filter-badge">
                “{query}”
                <button
                  type="button"
                  onClick={() => handleQueryChange('')}
                  aria-label="Quitar filtro de texto"
                >
                  ✕
                </button>
              </span>
            )}
            {province && (
              <span className="active-filter-badge">
                {province}
                <button
                  type="button"
                  onClick={() => {
                    setProvince('');
                    syncUrlParam('province', '');
                  }}
                  aria-label="Quitar filtro de provincia"
                >
                  ✕
                </button>
              </span>
            )}
            {type && (
              <span className="active-filter-badge">
                {type}
                <button
                  type="button"
                  onClick={() => {
                    setType('');
                    syncUrlParam('type', '');
                  }}
                  aria-label="Quitar filtro de modalidad"
                >
                  ✕
                </button>
              </span>
            )}
            {distance && (
              <span className="active-filter-badge">
                {distance}K
                <button
                  type="button"
                  onClick={() => {
                    setDistance('');
                    syncUrlParam('distance', '');
                  }}
                  aria-label="Quitar filtro de distancia"
                >
                  ✕
                </button>
              </span>
            )}
            {onlyOpen && (
              <span className="active-filter-badge">
                Abiertas
                <button
                  type="button"
                  onClick={() => {
                    setOnlyOpen(false);
                    syncUrlParam('onlyOpen', '');
                  }}
                  aria-label="Quitar filtro solo abiertas"
                >
                  ✕
                </button>
              </span>
            )}
          </div>

          {(query || province || type || onlyOpen || distance) && (
            <button className="text-button" onClick={clear}>
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="catalog-view-toggle" role="group" aria-label="Modo de visualización">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
            onClick={() => handleViewChange('grid')}
            aria-label="Vista en cuadrícula"
            title="Vista en cuadrícula"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="view-toggle-label">Cuadrícula</span>
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
            onClick={() => handleViewChange('list')}
            aria-label="Vista en lista"
            title="Vista en lista"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span className="view-toggle-label">Lista</span>
          </button>
        </div>
      </div>

      {races.length === 0 ? (
        <div className="empty-state">
          <span>0</span>
          <h2>No hay una carrera aquí todavía.</h2>
          <p>Prueba otra provincia, distancia o modalidad, o limpia los filtros.</p>
          <button className="button button--dark" onClick={clear}>
            Ver todas
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="catalog-grid">
          {races.map((race, index) => (
            <RaceCard
              key={race.id}
              race={race}
              priority={index < 6}
              animated
            />
          ))}
        </div>
      ) : (
        <div className="race-list">
          {races.map((race, index) => (
            <RaceRow key={race.id} race={race} priority={index < 6} />
          ))}
        </div>
      )}
    </div>
  );
}
