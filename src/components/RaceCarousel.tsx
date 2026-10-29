import { useState, useEffect, useMemo, useRef } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';
import { formatMoney, formatShortDate } from '@/lib/format';

interface Props {
  races: RaceSummary[];
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function RaceCarousel({ races = [] }: Props) {
  const activeRaces = useMemo(() => {
    return races.filter((race) => race.status === 'open');
  }, [races]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  // Swipe support refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 45;

  if (!activeRaces || activeRaces.length === 0) {
    return (
      <div className="next-race__content" style={{ color: '#888', padding: '2rem 0' }}>
        No hay carreras próximas con inscripciones abiertas.
      </div>
    );
  }

  const validIndex = currentIndex >= activeRaces.length ? 0 : currentIndex;
  const currentRace = activeRaces[validIndex];

  const transitionTo = (newIndex: number) => {
    if (newIndex === validIndex || isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsFading(false);
    }, 180);
  };

  const prevSlide = () => {
    const nextIdx = validIndex === 0 ? activeRaces.length - 1 : validIndex - 1;
    transitionTo(nextIdx);
  };

  const nextSlide = () => {
    const nextIdx = validIndex === activeRaces.length - 1 ? 0 : validIndex + 1;
    transitionTo(nextIdx);
  };

  // Autoplay with pause on hover
  useEffect(() => {
    if (isPaused || activeRaces.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, validIndex, activeRaces.length, isFading]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!currentRace?.startsAt) {
      setTimeRemaining(null);
      return;
    }

    const targetTime = new Date(currentRace.startsAt).getTime();
    if (isNaN(targetTime)) {
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const difference = targetTime - Date.now();
      if (difference <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeRemaining({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [validIndex, currentRace]);

  return (
    <article
      className="next-race__card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carrusel"
      aria-label="Carreras destacadas próximas"
    >
      {/* Imagen con badges */}
      <div className="next-race__image">
        <img
          src={currentRace.imageUrl}
          alt={currentRace.name}
          className={isFading ? 'next-race__img--fading' : ''}
        />
        <div className="next-race__image-badges">
          <span className="race-carousel__number">
            {String(validIndex + 1).padStart(2, '0')} / {String(activeRaces.length).padStart(2, '0')}
          </span>
          <span className="race-carousel__live-badge">
            <span className="race-carousel__live-dot"></span>
            Inscripción abierta
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`next-race__content ${isFading ? 'next-race__content--fading' : ''}`}>
        <span className="section-index">01 — Próximamente</span>

        <h2>{currentRace.name}</h2>

        {/* Badges / Metadatos ordenados */}
        <div className="next-race__pills">
          <span className="next-race__pill next-race__pill--date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formatShortDate(currentRace.startsAt)}
          </span>

          <span className="next-race__pill next-race__pill--location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {currentRace.city} · {currentRace.province}
          </span>

          <span className="next-race__pill next-race__pill--distance">
            {currentRace.distanceLabel}
          </span>

          <span className="next-race__pill next-race__pill--type">
            {currentRace.type}
          </span>

          <span className="next-race__pill next-race__pill--price">
            Desde {formatMoney(currentRace.priceFrom)}
          </span>
        </div>

        {/* Bloque Deportivo Countdown */}
        <div className="next-race__countdown-box">
          <span className="next-race__countdown-title">Cuenta atrás para la salida</span>
          {timeRemaining ? (
            timeRemaining.isExpired ? (
              <div className="next-race__timer-live">¡Prueba en curso!</div>
            ) : (
              <div className="next-race__timer-grid" role="timer" aria-live="off">
                <div className="next-race__timer-card">
                  <strong className="next-race__timer-number">
                    {String(timeRemaining.days).padStart(2, '0')}
                  </strong>
                  <span className="next-race__timer-unit">Días</span>
                </div>
                <span className="next-race__timer-sep" aria-hidden="true">:</span>
                <div className="next-race__timer-card">
                  <strong className="next-race__timer-number">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </strong>
                  <span className="next-race__timer-unit">Horas</span>
                </div>
                <span className="next-race__timer-sep" aria-hidden="true">:</span>
                <div className="next-race__timer-card">
                  <strong className="next-race__timer-number">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </strong>
                  <span className="next-race__timer-unit">Min</span>
                </div>
                <span className="next-race__timer-sep" aria-hidden="true">:</span>
                <div className="next-race__timer-card">
                  <strong className="next-race__timer-number">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </strong>
                  <span className="next-race__timer-unit">Seg</span>
                </div>
              </div>
            )
          ) : (
            <div className="next-race__timer-loading">Calculando cuenta atrás...</div>
          )}
        </div>

        {/* Acciones y Controles de navegación */}
        <div className="next-race__actions">
          <a className="button button--dark next-race__btn" href={`/carreras/${currentRace.slug}`}>
            Ver carrera <span>→</span>
          </a>

          <div className="race-carousel__controls" aria-label="Controles del carrusel">
            <button
              type="button"
              onClick={prevSlide}
              className="carousel-btn"
              aria-label="Carrera anterior"
              title="Carrera anterior"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="carousel-dots" role="tablist" aria-label="Paginación de carreras">
              {activeRaces.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={idx === validIndex}
                  aria-label={`Ir a carrera ${idx + 1}`}
                  className={`dot ${idx === validIndex ? 'dot--active' : ''}`}
                  onClick={() => transitionTo(idx)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              className="carousel-btn"
              aria-label="Siguiente carrera"
              title="Siguiente carrera"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
