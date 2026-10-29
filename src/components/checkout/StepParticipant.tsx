import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react';
import type { PortalAccount } from '@/lib/race-portal/types';
import type { ParticipantFormData } from './types';

interface StepParticipantProps {
  raceSlug: string;
  initialAccount?: PortalAccount | null;
  participant: ParticipantFormData;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - 12 - i));

export default function StepParticipant({
  raceSlug,
  initialAccount,
  participant,
  onChange,
  onSubmit,
  onBack,
  onSaveDraft,
}: StepParticipantProps) {
  const loginNextUrl = `/acceso?next=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.pathname : `/inscripcion/${raceSlug}`
  )}`;

  // Parse initial birth date (YYYY-MM-DD)
  const initialParts = (participant.birthDate || '').split('-');
  const [day, setDay] = useState(initialParts.length === 3 ? initialParts[2] : '');
  const [month, setMonth] = useState(initialParts.length === 3 ? initialParts[1] : '');
  const [year, setYear] = useState(initialParts.length === 3 ? initialParts[0] : '');

  // Días dinámicos según mes y año (28/29 en febrero bisiesto, 30 o 31)
  const maxDays = useMemo(() => {
    if (!month) return 31;
    const y = Number(year) || 2000;
    const m = Number(month);
    return new Date(y, m, 0).getDate();
  }, [month, year]);

  const daysList = useMemo(
    () => Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0')),
    [maxDays]
  );

  useEffect(() => {
    if (participant.birthDate) {
      const parts = participant.birthDate.split('-');
      if (parts.length === 3) {
        setYear(parts[0] || '');
        setMonth(parts[1] || '');
        setDay(parts[2] || '');
      }
    }
  }, [participant.birthDate]);

  function notifyDate(d: string, m: string, y: string) {
    const formatted =
      d && m && y
        ? `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
        : '';
    onChange({
      target: { name: 'birthDate', value: formatted },
    } as unknown as ChangeEvent<HTMLInputElement>);
  }

  function handleDayChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setDay(val);
    notifyDate(val, month, year);
  }

  function handleMonthChange(e: ChangeEvent<HTMLSelectElement>) {
    const newMonth = e.target.value;
    setMonth(newMonth);
    const max = newMonth ? new Date(Number(year) || 2000, Number(newMonth), 0).getDate() : 31;
    let adjustedDay = day;
    if (day && Number(day) > max) {
      adjustedDay = String(max).padStart(2, '0');
      setDay(adjustedDay);
    }
    notifyDate(adjustedDay, newMonth, year);
  }

  function handleYearChange(e: ChangeEvent<HTMLSelectElement>) {
    const newYear = e.target.value;
    setYear(newYear);
    const max = month ? new Date(Number(newYear) || 2000, Number(month), 0).getDate() : 31;
    let adjustedDay = day;
    if (day && Number(day) > max) {
      adjustedDay = String(max).padStart(2, '0');
      setDay(adjustedDay);
    }
    notifyDate(adjustedDay, month, newYear);
  }

  return (
    <>
      <span className="section-index">02 / 03</span>
      <h2>¿Quién corre?</h2>
      <p className="section-lead">
        Estos datos irán al dorsal y deben coincidir con tu documento de identidad.
      </p>

      {initialAccount ? (
        <div className="checkout-auth-badge">
          ✓ Sesión activa con DNI <strong>{initialAccount.dni}</strong>. Datos autocompletados.
        </div>
      ) : (
        <div className="checkout-auth-prompt">
          <p>
            ¿Ya tienes cuenta PULSO?{' '}
            <a href={loginNextUrl} onClick={onSaveDraft}>
              Entra con tu DNI
            </a>{' '}
            para autocompletar tus datos y vincular tu dorsal.
          </p>
        </div>
      )}

      <form className="participant-form" onSubmit={onSubmit}>
        <div className="participant-grid participant-grid--name">
          <label>
            <span>Nombre</span>
            <input
              required
              name="firstName"
              value={participant.firstName}
              onChange={onChange}
              placeholder="Tu nombre"
            />
          </label>

          <label>
            <span>Apellidos</span>
            <input
              required
              name="lastName"
              value={participant.lastName}
              onChange={onChange}
              placeholder="Tus apellidos"
            />
          </label>
        </div>

        <div className="participant-grid participant-grid--document">
          <label>
            <span>Documento</span>
            <select
              name="documentType"
              value={participant.documentType}
              onChange={onChange}
            >
              <option value="dni">DNI</option>
              <option value="nie">NIE</option>
              <option value="passport">Pasaporte</option>
            </select>
          </label>
          <label>
            <span>Número</span>
            <input
              required
              name="document"
              value={participant.document}
              onChange={onChange}
              placeholder="12345678Z"
              style={{ textTransform: 'uppercase' }}
            />
          </label>
        </div>

        <div className="participant-grid participant-grid--contact">
          <label>
            <span>Teléfono</span>
            <input
              required
              type="tel"
              name="phone"
              value={participant.phone}
              onChange={onChange}
              placeholder="600 000 000"
            />
          </label>

          <div className="birthdate-field">
            <span className="birthdate-label">Fecha de nacimiento</span>
            <div className="birthdate-selects">
              <select
                required
                value={day}
                onChange={handleDayChange}
                className="birthdate-select"
                aria-label="Día de nacimiento"
              >
                <option value="">DD</option>
                {daysList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                required
                value={month}
                onChange={handleMonthChange}
                className="birthdate-select"
                aria-label="Mes de nacimiento"
              >
                <option value="">MM</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                required
                value={year}
                onChange={handleYearChange}
                className="birthdate-select birthdate-select--year"
                aria-label="Año de nacimiento"
              >
                <option value="">AAAA</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="hidden"
              name="birthDate"
              value={
                day && month && year
                  ? `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                  : ''
              }
            />
          </div>
        </div>

        <label>
          <span>
            Club <small>(opcional)</small>
          </span>
          <input
            name="club"
            value={participant.club}
            onChange={onChange}
            placeholder="Nombre de tu club"
          />
        </label>

        <div className="button-row">
          <button type="button" className="text-button" onClick={onBack}>
            ← Atrás
          </button>
          <button type="submit" className="button button--dark">
            Continuar a revisión <span>→</span>
          </button>
        </div>
      </form>
    </>
  );
}
