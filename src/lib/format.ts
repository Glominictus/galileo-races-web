export function formatDate(value: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric', ...options }).format(new Date(value));
}
export function formatShortDate(value: string) { return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(value)).replace('.', ''); }
export function formatMoney(value: number) { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value); }
export const statusCopy = { open: 'Inscripción abierta', upcoming: 'Próximamente', 'sold-out': 'Plazas agotadas', closed: 'Inscripción cerrada' } as const;
