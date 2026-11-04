import type { RaceSummary } from '@/lib/race-portal/types';
import { formatDayMonth, formatMoney, formatShortDate, statusCopy } from '@/lib/format';

export interface RaceRowProps {
  race: RaceSummary;
  priority?: boolean;
  className?: string;
}

export default function RaceRow({ race, priority = false, className = '' }: RaceRowProps) {
  const { day, month } = formatDayMonth(race.startsAt);

  return (
    <article className={`race-row ${className}`.trim()}>
      <a
        className="race-row__image"
        href={`/carreras/${race.slug}`}
        aria-label={`Ver ${race.name}`}
      >
        <img
          src={race.imageUrl}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
        />
        <div className="race-row__date-badge">
          <span className="race-row__date-day">{day}</span>
          <span className="race-row__date-month">{month}</span>
        </div>
      </a>

      <div className="race-row__content">
        <div className="race-row__eyebrow">
          <span>{formatShortDate(race.startsAt)}</span>
          <span className="race-row__eyebrow-dot" aria-hidden="true">·</span>
          <span>{race.city} ({race.province})</span>
        </div>
        <h3>
          <a href={`/carreras/${race.slug}`}>{race.name}</a>
        </h3>
        <div className="race-row__meta">
          <span className="race-row__chip">{race.distanceLabel}</span>
          <span className="race-row__price">
            desde <strong>{formatMoney(race.priceFrom)}</strong>
          </span>
        </div>
        <div className={`status status--${race.status}`}>
          <i />
          <span>{statusCopy[race.status]}</span>
        </div>
      </div>

      <a
        className="round-link"
        href={`/carreras/${race.slug}`}
        aria-label={`Abrir ${race.name}`}
      >
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

