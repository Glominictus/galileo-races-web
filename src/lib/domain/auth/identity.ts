/**
 * Dominio Identidad / Autenticación: Normalización y validación de documentos oficiales (DNI / NIE)
 */

import { z } from 'zod';

export const DNI_REGEX = /^([XYZ]\d{7}|\d{8})[A-Z]$/;

/**
 * Normaliza cualquier documento eliminando espacios y guiones y convirtiéndolo a mayúsculas.
 */
export function normalizeDocument(value: string): string {
  return (value ?? '').trim().toUpperCase().replace(/[\s-]/g, '');
}

/**
 * Valida la estructura básica de formato de DNI o NIE español.
 */
export function isValidDniOrNie(value: string): boolean {
  return DNI_REGEX.test(normalizeDocument(value));
}

/**
 * Esquema Zod reutilizable para campos de DNI o NIE.
 */
export const documentSchema = z
  .string()
  .trim()
  .transform(normalizeDocument)
  .refine(isValidDniOrNie, {
    message: 'Introduce un DNI o NIE con formato válido (ej. 12345678Z).',
  });
