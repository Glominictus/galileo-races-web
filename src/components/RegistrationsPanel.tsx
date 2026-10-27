import { useEffect, useState } from 'react';
import { formatDate, formatMoney } from '@/lib/format';
import type { Registration } from '@/lib/race-portal/types';

export default function RegistrationsPanel() {
  const [items, setItems] = useState<Registration[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/account/registrations')
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = '/acceso';
          return;
        }
        if (!response.ok) {
          setError(true);
          return;
        }
        setItems(await response.json());
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="empty-state">
        <h2>No pudimos cargar tus carreras.</h2>
        <button className="button button--dark" onClick={() => location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="loading-state">
        <i />
        <span>Buscando tus dorsales</span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="empty-state">
        <span>0</span>
        <h2>Tu próxima salida empieza aquí.</h2>
        <p>Cuando te inscribas, encontrarás todas tus pruebas en este espacio.</p>
        <a className="button button--dark" href="/carreras">
          Explorar carreras
        </a>
      </div>
    );
  }

  return (
    <div className="registration-list">
      {items.map((item, index) => {
        const departure =
          item.departureTime ||
          (item.startsAt
            ? `${new Date(item.startsAt).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })} h`
            : '09:30 h');

        const bibPickup = item.bibPickupTime || 'Desde 08:00 h';

        return (
          <article className="registration-card" key={item.id}>
            <a
              className="registration-card__image"
              href={`/carreras/${item.raceSlug}`}
              aria-label={`Ver ${item.raceName}`}
            >
              <img src={item.imageUrl} alt={item.raceName} />
              <span className="registration-card__badge">
                {item.bibNumber ? `Dorsal ${item.bibNumber}` : String(index + 1).padStart(2, '0')}
              </span>
            </a>

            <div className="registration-card__content">
              <div className="registration-card__eyebrow">
                <span>{formatDate(item.startsAt)}</span>
                <span>{item.location}</span>
              </div>

              <h3>
                <a href={`/carreras/${item.raceSlug}`}>{item.raceName}</a>
              </h3>

              <div className="registration-card__meta">
                <span className="registration-card__event">{item.eventName}</span>
                <span className="registration-card__participant">
                  Corredor: <strong>{item.participantName}</strong>
                </span>
                <span className="registration-card__price">
                  Total: <strong>{formatMoney(item.total)}</strong>
                </span>
              </div>

              <div className="registration-card__schedule">
                <div className="schedule-item">
                  <span className="schedule-item__label">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Salida
                  </span>
                  <strong className="schedule-item__value">{departure}</strong>
                </div>

                <div className="schedule-item">
                  <span className="schedule-item__label">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Recogida dorsal
                  </span>
                  <strong className="schedule-item__value">{bibPickup}</strong>
                </div>
              </div>

              <div className="registration-card__bottom">
                <div
                  className={`status status--${
                    item.paidState === 'paid'
                      ? 'open'
                      : item.paidState === 'pending'
                      ? 'upcoming'
                      : 'closed'
                  }`}
                >
                  <i />
                  <span>
                    {item.paidState === 'paid'
                      ? 'Inscripción confirmada'
                      : item.paidState === 'pending'
                      ? 'Pago pendiente'
                      : 'Pago fallido'}
                  </span>
                </div>

                <a
                  className="round-link"
                  href={`/carreras/${item.raceSlug}`}
                  aria-label={`Ver detalles de ${item.raceName}`}
                >
                  <span>↗</span>
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
