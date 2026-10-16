import { useState, useEffect, useMemo } from 'react';
import type { RaceSummary } from '@/lib/race-portal/types';
import { formatMoney, formatShortDate, statusCopy } from '@/lib/format';

interface Props {
    races: RaceSummary[];
}

export default function RaceCarousel({ races = [] }: Props) {
    const activeRaces = useMemo(() => {
        return races.filter((race) => race.status === 'open');
    }, [races]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState<string>('Calculando...');

    if (!activeRaces || activeRaces.length === 0) {
        return (
            <div className="next-race__content" style={{ color: '#888', padding: '2rem 0' }}>
                No hay carreras próximas con inscripciones abiertas.
            </div>
        );
    }

    const validIndex = currentIndex >= activeRaces.length ? 0 : currentIndex;
    const currentRace = activeRaces[validIndex];

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? activeRaces.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === activeRaces.length - 1 ? 0 : prev + 1));
    };

    useEffect(() => {
        if (!currentRace?.startsAt) {
            setTimeLeft('Fecha no disponible');
            return;
        }

        const targetTime = new Date(currentRace.startsAt).getTime();

        if (isNaN(targetTime)) {
            setTimeLeft('Fecha inválida');
            return;
        }

        const updateCountdown = () => {
            const now = Date.now();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft('¡En carrera!');
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(`${days}d · ${hours}h · ${minutes}m · ${seconds}s`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [validIndex, currentRace]);

    return (
        <article className="next-race__card">
            <div className="next-race__image">
                <img src={currentRace.imageUrl} alt={currentRace.name} />
                    <span className="race-carousel__number">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(activeRaces.length).padStart(2, '0')}
                    </span>
            </div>

            <div className="next-race__content">
                <span className="section-index">01 — Próximamente</span>

                <h2>{currentRace.name}</h2>

                <div className="next-race__info">
                    <span>{formatShortDate(currentRace.startsAt)} </span>
                    <span>
                        {currentRace.city}  ·  {currentRace.province}
                    </span>
                    <span> {currentRace.distanceLabel} </span>
                    <span> {currentRace.type} </span>
                    <span>Desde {formatMoney(currentRace.priceFrom)}</span>
                </div>
                
                <br />

                <div className="next-race__countdown">
                    <span>Faltan: </span>
                    <strong>{timeLeft}</strong>
                </div>

                <div className="next-race__actions">
                    <a className="button button--dark" href={`/carreras/${currentRace.slug}`}>
                        Ver carrera <span>→</span>
                    </a>

                    <div className="race-carousel__controls">
                        <button type="button" onClick={prevSlide} className="carousel-btn" aria-label="Anterior">
                            ←
                        </button>
                        <div className="carousel-dots">
                            {activeRaces.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    className={`dot ${idx === currentIndex ? 'dot--active' : ''}`}
                                    onClick={() => setCurrentIndex(idx)}
                                />
                            ))}
                        </div>
                        <button type="button" onClick={nextSlide} className="carousel-btn" aria-label="Siguiente">
                            →
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}