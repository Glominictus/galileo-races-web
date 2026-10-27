export function formatDate(value: string | Date, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', ...options }).format(new Date(value));
}

export function formatShortDate(value: string | Date) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(value)).replace('.', '');
}

export function formatMonthName(value: string | Date) {
  const name = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(value));
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatBirthDate(dateStr?: string) {
  if (!dateStr) return 'No registrada';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) return `${day}/${month}/${year}`;
    return new Date(dateStr).toLocaleDateString('es-ES');
  } catch {
    return dateStr;
  }
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export const statusCopy = {
  open: 'Inscripción abierta',
  upcoming: 'Próximamente',
  'sold-out': 'Plazas agotadas',
  closed: 'Inscripción cerrada',
} as const;
