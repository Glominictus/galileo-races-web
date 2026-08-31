import { expect, test } from '@playwright/test';

test('home presents the editorial proposition and featured races', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Encuentra tu próxima salida/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar carreras' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Media Maratón de Maceda' })).toBeVisible();
});

test('catalog filters races without importing fixtures in the island', async ({ page }) => {
  await page.goto('/carreras');
  await page.getByLabel('Terreno').selectOption('trail');
  await expect(page.getByText('1 pruebas encontradas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trail Serra do Courel' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Media Maratón de Maceda' })).toHaveCount(0);
});

test('race detail includes structured event data and closed state', async ({ page }) => {
  await page.goto('/carreras/trail-serra-do-courel-2026');
  await expect(page.getByRole('heading', { name: 'Trail Serra do Courel', level: 1 })).toBeVisible();
  await expect(page.getByText('Plazas agotadas').first()).toBeVisible();
  expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain('SportsEvent');
});

test('login persists a server-only session and opens the account', async ({ page }) => {
  await page.goto('/acceso');
  await page.getByLabel('Email').fill('corredora@pulso.gal');
  await page.getByLabel('Contraseña').fill('demostracion');
  await page.getByRole('button', { name: 'Entrar en PULSO' }).click();
  await expect(page).toHaveURL('/cuenta');
  await expect(page.getByRole('heading', { name: 'Iria Varela' })).toBeVisible();
});

test('authenticated runner can complete the mocked registration flow', async ({ page }) => {
  await page.request.post('/api/auth/login', { data: { email: 'corredora@pulso.gal', password: 'demostracion' } });
  await page.goto('/inscripcion/media-maraton-maceda-2026');
  await page.getByRole('button', { name: /Continuar/ }).click();
  await page.getByLabel('Nombre').fill('Iria');
  await page.getByLabel('Apellidos').fill('Varela');
  await page.getByLabel('Número').fill('00000000T');
  await page.getByLabel('Nacimiento').fill('1990-01-01');
  await page.getByLabel('Teléfono').fill('600000000');
  await page.getByRole('button', { name: /Revisar inscripción/ }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Ir al pago seguro/ }).click();
  await expect(page).toHaveURL(/\/pago\/retorno\?order=mock-/);
  await expect(page.getByRole('heading', { name: 'Pago recibido.' })).toBeVisible();
});
