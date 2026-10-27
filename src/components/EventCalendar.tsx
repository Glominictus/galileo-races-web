import { useState, useMemo } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';
import { formatMonthName } from '@/lib/format';

interface Props {
  races: RaceSummary[];
}

export default function EventCalendar({ races }: Props) {
  // Mes seleccionado (por defecto Septiembre 2026 o el mes actual)
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-01'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  // Cálculo de días del mes para pintar la cuadrícula
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Mapear carreras por el día exacto del mes
  const racesByDay = useMemo(() => {
    const map: Record<number, RaceSummary[]> = {};
    races.forEach((race) => {
      const date = new Date(race.startsAt);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(race);
      }
    });
    return map;
  }, [races, year, month]);

  return (
    <div className="calendar-widget">
      <header className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn">←</button>
        <h2>{formatMonthName(currentDate)} <span>{year}</span></h2>
        <button onClick={nextMonth} className="calendar-nav-btn">→</button>
      </header>

      <div className="calendar-legend">
        <span className="legend-item"><i className="dot dot--open"></i> Abierta</span>
        <span className="legend-item"><i className="dot dot--upcoming"></i> Próximamente</span>
        <span className="legend-item"><i className="dot dot--sold-out"></i> Agotada</span>
        <span className="legend-item"><i className="dot dot--closed"></i> Cerrada</span>
      </div>

      <div className="calendar-weekdays">
        <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span>
        <span>Vie</span><span>Sáb</span><span>Dom</span>
      </div>

      <div className="calendar-grid">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day day--empty"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dayRaces = racesByDay[dayNumber] || [];

          return (
            <div key={dayNumber} className={`calendar-day ${dayRaces.length > 0 ? 'day--has-events' : ''}`}>
              <span className="day-number">{dayNumber}</span>

              <div className="day-events">
                {dayRaces.map((race) => (
                  <a
                    key={race.id}
                    href={`/carreras/${race.slug}`}
                    className={`event-badge event-badge--${race.status}`}
                    title={`${race.name} (${race.city})`}
                  >
                    <span className="badge-dot"></span>
                    <span className="badge-name">{race.name}</span>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
