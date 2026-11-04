import type { RaceSummary } from '@/lib/race-portal/types';
import { formatDayMonth, formatMoney, statusCopy } from '@/lib/format';

export interface RaceCardProps {
  race: RaceSummary;
  priority?: boolean;
  animated?: boolean;
}

export default function RaceCard({ race, priority = false, animated = false }: RaceCardProps) {
  const { day, month } = formatDayMonth(race.startsAt);

  return (
    <article className={`race-card ${animated ? 'race-card--animated' : ''}`}>
      <div className="race-card__media">
        <img
          src={race.imageUrl}
          alt={`Prueba deportiva ${race.name}`}
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="race-card__overlay"></div>

        <div className="race-card__top-bar">
          <div className={`card-status card-status--${race.status}`}>
            <span className="card-status__dot"></span>
            <span className="card-status__label">{statusCopy[race.status] || race.status}</span>
          </div>

          <span className="card-badge card-badge--type">{race.type}</span>
        </div>

        <div className="race-card__date-tag">
          <span className="date-day">{day}</span>
          <span className="date-month">{month}</span>
        </div>
      </div>

      <div className="race-card__body">
        <div className="race-card__location">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>{race.city} · {race.province}</span>
        </div>

        <h3 className="race-card__title">
          <a href={`/carreras/${race.slug}`}>{race.name}</a>
        </h3>

        <div className="race-card__specs">
          <span className="spec-chip spec-chip--dist">
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
            </svg>
            {race.distanceLabel}
          </span>
          <span className="spec-price">
            <small>desde</small> <strong>{formatMoney(race.priceFrom)}</strong>
          </span>
        </div>

        <div className="race-card__footer">
          <a
            className={`button-card ${race.status === 'open' ? 'button-card--primary' : 'button-card--secondary'}`}
            href={`/carreras/${race.slug}`}
          >
            <span>Ver carrera</span> <span className="button-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}
