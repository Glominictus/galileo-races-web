import { useState, useEffect } from 'react';
import { calculateCountdown, type CountdownState } from '@/lib/countdown';

interface Props {
  targetDate?: string | Date | number | null;
  title?: string;
  className?: string;
  showIcon?: boolean;
}

export default function RaceCountdown({
  targetDate,
  title = 'Cuenta atrás para la salida',
  className = '',
  showIcon = true,
}: Props) {
  const [countdown, setCountdown] = useState<CountdownState | null>(() =>
    calculateCountdown(targetDate)
  );

  useEffect(() => {
    setCountdown(calculateCountdown(targetDate));

    if (!targetDate) return;

    const timer = setInterval(() => {
      const next = calculateCountdown(targetDate);
      setCountdown(next);
      if (next?.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate || !countdown) {
    return null;
  }

  return (
    <div className={`race-countdown ${className}`.trim()}>
      <span className="race-countdown__title">
        {showIcon && (
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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )}
        {title}
      </span>

      {countdown.isExpired ? (
        <div className="race-countdown__live">¡Prueba en curso o finalizada!</div>
      ) : (
        <div className="race-countdown__grid" role="timer" aria-live="off">
          <div className="race-countdown__card">
            <strong className="race-countdown__number" suppressHydrationWarning>
              {String(countdown.days).padStart(2, '0')}
            </strong>
            <span className="race-countdown__unit">Días</span>
          </div>
          <span className="race-countdown__sep" aria-hidden="true">:</span>
          <div className="race-countdown__card">
            <strong className="race-countdown__number" suppressHydrationWarning>
              {String(countdown.hours).padStart(2, '0')}
            </strong>
            <span className="race-countdown__unit">Horas</span>
          </div>
          <span className="race-countdown__sep" aria-hidden="true">:</span>
          <div className="race-countdown__card">
            <strong className="race-countdown__number" suppressHydrationWarning>
              {String(countdown.minutes).padStart(2, '0')}
            </strong>
            <span className="race-countdown__unit">Min</span>
          </div>
          <span className="race-countdown__sep" aria-hidden="true">:</span>
          <div className="race-countdown__card">
            <strong className="race-countdown__number" suppressHydrationWarning>
              {String(countdown.seconds).padStart(2, '0')}
            </strong>
            <span className="race-countdown__unit">Seg</span>
          </div>
        </div>
      )}
    </div>
  );
}

