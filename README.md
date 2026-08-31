# PULSO · Galileo Races Web

Marketplace multiinstalación de carreras construido con Astro. La primera fase utiliza datos simulados, pero toda la aplicación consume una única interfaz (`RacePortalClient`) preparada para conectarse a Galileo.

## Puesta en marcha

```bash
cp .env.example .env
npm install
npm run dev
```

En Windows, copia `.env.example` como `.env`. Por defecto `GALILEO_USE_MOCKS=true` y no es necesario ejecutar Galileo.

## Comandos

- `npm run dev`: desarrollo local.
- `npm run build`: build SSR para Node.
- `npm run start`: inicia el build SSR generado.
- `npm run check`: comprobación Astro/TypeScript.
- `npm test`: pruebas unitarias.
- `npm run test:e2e`: build y pruebas Playwright en escritorio y móvil.

## Arquitectura

```text
Browser → Astro pages/islands → Astro BFF (/api/*) → RacePortalClient
                                                   ├─ MockRacePortalClient
                                                   └─ GalileoRacePortalClient
```

- Los componentes y páginas nunca importan fixtures.
- La API key de Galileo solo se lee en código `.server.ts`.
- Las cookies de sesión son `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- El BFF valida cuerpos, limita el acceso a cuenta/pedidos y exige idempotencia al crear una inscripción.
- Precios, plazas, dorsales y pagos reales seguirán siendo responsabilidad de Galileo.

## Contrato esperado de Galileo

Base: `/api/v2/galileo/race-portal`

- `GET /races`
- `GET /races/:slug`
- `GET /races/:slug/availability`
- `POST /auth/login`
- `POST /auth/register`
- `GET /account`
- `GET /account/registrations`
- `POST /races/:slug/orders`

Los tipos que formalizan este contrato están en `src/lib/race-portal/types.ts`. El proveedor HTTP está listo; basta configurar las variables de entorno y poner `GALILEO_USE_MOCKS=false`.

## Identidad visual

PULSO es un nombre de trabajo modificable. La dirección visual mezcla fotografía deportiva documental, negro cálido, papel y un único acento lima. Las imágenes del repositorio fueron generadas expresamente para este prototipo y no dependen de servicios externos.
