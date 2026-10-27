/**
 * Dominio Carreras: Lógica y utilidades de distancias
 */

export function parseDistances(label: string): number[] {
  if (!label) return [];
  const matches = label.match(/\d+(?:[.,]\d+)?/g);
  return matches ? matches.map((val) => parseFloat(val.replace(',', '.'))) : [];
}

export function matchesDistance(raceDistanceLabel: string, selectedDistance: string): boolean {
  if (!selectedDistance) return true;
  const target = parseFloat(selectedDistance);
  if (Number.isNaN(target)) return true;

  const distances = parseDistances(raceDistanceLabel);
  return distances.some((km) => {
    if (target === 21) {
      // Media maratón: 21 o 21.1 km
      return km >= 21 && km <= 21.5;
    }
    if (target === 42) {
      // Maratón: 42 o 42.2 km
      return km >= 42 && km <= 42.5;
    }
    // Comparación numérica para distancias estándar (tolerancia 0.5 km)
    return Math.abs(km - target) < 0.5;
  });
}
