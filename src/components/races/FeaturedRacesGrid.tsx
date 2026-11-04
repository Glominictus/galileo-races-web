import { useState, useMemo } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';
import RaceCard from './RaceCard';
import RaceRow from './RaceRow';

interface Props {
  races: RaceSummary[];
}

type FilterCategory = 'all' | 'asfalto' | 'trail' | 'andaina';

export default function FeaturedRacesGrid({ races = [] }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const filterOptions: { id: FilterCategory; label: string; count: number }[] = useMemo(() => [
    { id: 'all', label: 'Todas', count: races.length },
    { id: 'asfalto', label: 'Asfalto', count: races.filter((r) => r.type === 'asfalto').length },
    { id: 'trail', label: 'Trail', count: races.filter((r) => r.type === 'trail').length },
    { id: 'andaina', label: 'Andaina', count: races.filter((r) => r.type === 'andaina').length },
  ], [races]);

  const filteredRaces = useMemo(() => {
    if (activeFilter === 'all') return races;
    return races.filter((r) => r.type === activeFilter);
  }, [races, activeFilter]);

  return (
    <div className="featured-section-content">
      <div className="featured-filter-tabs" role="tablist" aria-label="Filtrar carreras por terreno">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            id={`featured-tab-${option.id}`}
            type="button"
            role="tab"
            aria-selected={activeFilter === option.id}
            aria-controls="featured-races-panel"
            className={`filter-tab ${activeFilter === option.id ? 'filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(option.id)}
          >
            <span className="filter-tab__label">{option.label}</span>
            <span className="filter-tab__count">{option.count}</span>
          </button>
        ))}
      </div>

      <div
        id="featured-races-panel"
        role="tabpanel"
        aria-labelledby={`featured-tab-${activeFilter}`}
      >
        {filteredRaces.length === 0 ? (
          <div className="featured-empty">
            <p>No hay pruebas destacadas en esta modalidad actualmente.</p>
          </div>
        ) : (
          <>
            <div className="featured-grid featured-grid--desktop">
              {filteredRaces.map((race, index) => (
                <RaceCard
                  key={race.id}
                  race={race}
                  priority={index < 3}
                  animated
                />
              ))}
            </div>

            <div className="race-list featured-list--mobile">
              {filteredRaces.map((race, index) => (
                <RaceRow
                  key={race.id}
                  race={race}
                  priority={index < 3}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
