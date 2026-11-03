/**
 * Dominio Identidad / Autenticación: Normalización y validación de documentos oficiales (DNI / NIE)
 */

import { z } from 'zod';
import type { DocumentType } from '@/lib/race-portal/types';

export const DNI_REGEX = /^([XYZ]\d{7}|\d{8})[A-Z]$/;
export const DNI_CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

/**
 * Normaliza cualquier documento eliminando espacios y guiones y convirtiéndolo a mayúsculas.
 */
export function normalizeDocument(value: string): string {
  return (value ?? '').trim().toUpperCase().replace(/[\s-]/g, '');
}

/**
 * Calcula la letra de control oficial según el algoritmo del Ministerio del Interior (Módulo 23).
 * Para NIE: X se sustituye por 0, Y por 1, y Z por 2.
 */
export function calculateDniLetter(document: string): string | null {
  const normalized = normalizeDocument(document);
  if (!/^([XYZ]\d{7}|\d{8})[A-Z]?$/.test(normalized)) return null;

  const niePrefix: Record<string, string> = { X: '0', Y: '1', Z: '2' };
  const numbersOnly = normalized
    .replace(/^[XYZ]/, (match) => niePrefix[match])
    .replace(/[A-Z]$/, '');

  if (numbersOnly.length !== 8) return null;

  const num = parseInt(numbersOnly, 10);
  if (Number.isNaN(num)) return null;

  return DNI_CONTROL_LETTERS[num % 23] ?? null;
}

/**
 * Valida la estructura y el dígito de control matemático oficial del DNI o NIE español.
 */
export function isValidDniOrNie(value: string): boolean {
  const normalized = normalizeDocument(value);
  if (!DNI_REGEX.test(normalized)) return false;

  const expectedLetter = calculateDniLetter(normalized);
  if (!expectedLetter) return false;

  return normalized.endsWith(expectedLetter);
}

/**
 * Deduce automáticamente el tipo de documento según el formato.
 */
export function detectDocumentType(value: string): DocumentType {
  const normalized = normalizeDocument(value);
  if (/^[XYZ]\d{7}[A-Z]$/.test(normalized)) return 'nie';
  return 'dni';
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
