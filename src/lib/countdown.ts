export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Calcula la diferencia de tiempo entre una fecha objetivo y el momento actual.
 * Devuelve null si la fecha objetivo no es válida.
 */
export function calculateCountdown(
  targetDate?: string | Date | number | null,
  now: number = Date.now()
): CountdownState | null {
  if (!targetDate) return null;

  const targetTime =
    typeof targetDate === 'number'
      ? targetDate
      : targetDate instanceof Date
        ? targetDate.getTime()
        : new Date(targetDate).getTime();

  if (Number.isNaN(targetTime)) return null;

  const difference = targetTime - now;
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  };
}

