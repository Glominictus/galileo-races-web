import { useState, useEffect, useId, type ChangeEvent } from 'react';

export interface BirthdatePickerProps {
  value?: string;
  onChange?: (dateStr: string) => void;
  required?: boolean;
  name?: string;
  label?: string;
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
  hasError?: boolean;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(CURRENT_YEAR - 12 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

function getDaysInMonth(yearStr: string, monthStr: string): number {
  if (!monthStr) return 31;
  const y = Number(yearStr) || 2000;
  const m = Number(monthStr);
  return new Date(y, m, 0).getDate();
}

export default function BirthdatePicker({
  value,
  onChange,
  required = false,
  name = 'birthDate',
  label = 'Fecha de nacimiento',
  showLabel = false,
  disabled = false,
  className = '',
  hasError = false,
}: BirthdatePickerProps) {
  const generatedId = useId();
  const initialParts = (value || '').split('-');
  const [year, setYear] = useState(initialParts[0] || '');
  const [month, setMonth] = useState(initialParts[1] || '');
  const [day, setDay] = useState(initialParts[2] || '');

  // Sincronizar si cambia el prop value externo
  useEffect(() => {
    if (value !== undefined) {
      const parts = value ? value.split('-') : [];
      const newY = parts[0] || '';
      const newM = parts[1] || '';
      const newD = parts[2] || '';
      setYear((prev) => (prev !== newY ? newY : prev));
      setMonth((prev) => (prev !== newM ? newM : prev));
      setDay((prev) => (prev !== newD ? newD : prev));
    }
  }, [value]);

  const maxDays = getDaysInMonth(year, month);
  const daysList = Array.from({ length: maxDays }, (_, i) => String(i + 1).padStart(2, '0'));

  function notifyDate(d: string, m: string, y: string) {
    const formatted = d && m && y ? `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '';
    onChange?.(formatted);
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

  const formattedValue = day && month && year
    ? `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    : '';

  return (
    <div className={`birthdate-field ${hasError ? 'has-error' : ''} ${className}`.trim()}>
      {showLabel && label && (
        <span className="birthdate-label" id={`${generatedId}-label`}>
          {label}
        </span>
      )}

      <div className="birthdate-selects" role="group" aria-labelledby={showLabel ? `${generatedId}-label` : undefined}>
        <select
          required={required}
          disabled={disabled}
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
          required={required}
          disabled={disabled}
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
          required={required}
          disabled={disabled}
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
        name={name}
        value={formattedValue}
      />
    </div>
  );
}
