import type { PortalAccount, RaceDetail, Registration } from './types';

export const mockRaces: RaceDetail[] = [
  {
    id: 'race-maceda-2026', slug: 'media-maraton-maceda-2026', name: 'Media Maratón de Maceda', city: 'Maceda', province: 'Ourense', type: 'asfalto', startsAt: '2026-09-27T09:30:00+02:00', registrationEndsAt: '2026-09-24T23:59:00+02:00', imageUrl: '/images/race-stone-town.png', distanceLabel: '21,1 km · 10 km', priceFrom: 14, status: 'open', featured: true,
    organizer: { id: 'maceda', name: 'Concello de Maceda', website: 'https://www.concellodemaceda.org' },
    description: 'Una mañana para atravesar el valle, medir el pulso de la villa y llegar juntos a la plaza. Dos distancias, un recorrido rápido y todo el carácter de Maceda.', locationName: 'Praza das Toldas, Maceda', latitude: 42.269, longitude: -7.651,
    modalities: [
      { id: 'media', name: 'Media maratón', distanceKm: 21.1, startAt: '2026-09-27T09:30:00+02:00', registrationEndsAt: '2026-09-24T23:59:00+02:00', priceFrom: 22, capacity: 650, availablePlaces: 184, status: 'open' },
      { id: 'popular', name: '10K popular', distanceKm: 10, startAt: '2026-09-27T10:00:00+02:00', registrationEndsAt: '2026-09-24T23:59:00+02:00', priceFrom: 14, capacity: 450, availablePlaces: 93, status: 'open' },
    ],
    schedule: [{ time: '08:00', label: 'Recogida de dorsales' }, { time: '09:15', label: 'Cámara de salida' }, { time: '09:30', label: 'Salida media maratón' }, { time: '12:30', label: 'Entrega de premios' }], included: ['Dorsal con chip', 'Avituallamientos', 'Guardarropa', 'Camiseta técnica'], rulesUrl: '#reglamento', seoDescription: 'Inscríbete en la Media Maratón de Maceda 2026. Modalidades de 21,1 km y 10 km en Ourense.',
  },
  {
    id: 'race-courel-2026', slug: 'trail-serra-do-courel-2026', name: 'Trail Serra do Courel', city: 'Folgoso do Courel', province: 'Lugo', type: 'trail', startsAt: '2026-10-18T08:00:00+02:00', registrationEndsAt: '2026-10-11T23:59:00+02:00', imageUrl: '/images/race-forest-trail.png', distanceLabel: '32 km · 16 km', priceFrom: 26, status: 'sold-out', featured: true,
    organizer: { id: 'courel', name: 'Montes do Courel' }, description: 'Senderos de pizarra, bosque atlántico y desnivel de verdad. Una carrera de montaña compacta, técnica y profundamente ligada al territorio.', locationName: 'Folgoso do Courel', latitude: 42.589, longitude: -7.195,
    modalities: [
      { id: 'ultra', name: 'Trail 32K', distanceKm: 32, startAt: '2026-10-18T08:00:00+02:00', registrationEndsAt: '2026-10-11T23:59:00+02:00', priceFrom: 38, capacity: 350, availablePlaces: 0, status: 'sold-out' },
      { id: 'curto', name: 'Trail 16K', distanceKm: 16, startAt: '2026-10-18T09:15:00+02:00', registrationEndsAt: '2026-10-11T23:59:00+02:00', priceFrom: 26, capacity: 300, availablePlaces: 0, status: 'sold-out' },
    ],
    schedule: [{ time: '06:45', label: 'Control de material' }, { time: '08:00', label: 'Salida 32K' }, { time: '09:15', label: 'Salida 16K' }], included: ['Cronometraje', 'Seguro de día', 'Avituallamientos', 'Producto local finisher'], seoDescription: 'Trail Serra do Courel 2026: modalidades de 32 km y 16 km en Folgoso do Courel, Lugo.',
  },
  {
    id: 'race-ribeira-2026', slug: 'carreira-da-ribeira-sacra-2026', name: 'Carreira da Ribeira Sacra', city: 'Monforte de Lemos', province: 'Lugo', type: 'asfalto', startsAt: '2026-11-08T10:00:00+01:00', registrationEndsAt: '2026-11-04T23:59:00+01:00', imageUrl: '/images/hero-running-galicia.png', distanceLabel: '15 km · 5 km', priceFrom: 10, status: 'upcoming', featured: true,
    organizer: { id: 'ribeira', name: 'Ribeira Sacra Corre' }, description: 'Del río al viñedo por una ruta que mezcla ciudad, paisaje y velocidad. Inscripciones disponibles próximamente.', locationName: 'Parque dos Condes, Monforte', latitude: 42.521, longitude: -7.514,
    modalities: [
      { id: '15k', name: 'Carreira 15K', distanceKm: 15, startAt: '2026-11-08T10:00:00+01:00', registrationEndsAt: '2026-11-04T23:59:00+01:00', priceFrom: 18, capacity: 500, availablePlaces: 500, status: 'upcoming' },
      { id: '5k', name: 'Popular 5K', distanceKm: 5, startAt: '2026-11-08T10:30:00+01:00', registrationEndsAt: '2026-11-04T23:59:00+01:00', priceFrom: 10, capacity: 300, availablePlaces: 300, status: 'upcoming' },
    ],
    schedule: [{ time: '08:30', label: 'Apertura de guardarropa' }, { time: '10:00', label: 'Salida 15K' }, { time: '10:30', label: 'Salida 5K' }], included: ['Dorsal', 'Cronometraje', 'Avituallamiento final'], seoDescription: 'Carreira da Ribeira Sacra 2026 en Monforte de Lemos. Modalidades de 15 km y 5 km.',
  },
  {
    id: 'race-andaina-2026', slug: 'andaina-costa-da-morte-2026', name: 'Andaina Costa da Morte', city: 'Muxía', province: 'A Coruña', type: 'andaina', startsAt: '2026-09-13T09:00:00+02:00', registrationEndsAt: '2026-08-29T23:59:00+02:00', imageUrl: '/images/hero-running-galicia.png', distanceLabel: '18 km', priceFrom: 12, status: 'closed', organizer: { id: 'muxia', name: 'Muxía en Ruta' },
    description: 'Una caminata abierta al Atlántico entre senderos costeros y piedra.', locationName: 'Porto de Muxía', latitude: 43.105, longitude: -9.217,
    modalities: [{ id: '18k', name: 'Andaina 18K', distanceKm: 18, startAt: '2026-09-13T09:00:00+02:00', registrationEndsAt: '2026-08-29T23:59:00+02:00', priceFrom: 12, capacity: 280, availablePlaces: 37, status: 'closed' }],
    schedule: [{ time: '08:15', label: 'Acreditaciones' }, { time: '09:00', label: 'Salida' }], included: ['Seguro', 'Avituallamiento', 'Ruta señalizada'], seoDescription: 'Andaina Costa da Morte 2026: ruta de 18 km desde Muxía.',
  },
];

export const mockAccount: PortalAccount = { id: 'account-demo', email: 'corredora@pulso.gal', firstName: 'Iria', lastName: 'Varela', emailVerified: true };

export const mockRegistrations: Registration[] = [
  { id: 'registration-1', raceSlug: 'media-maraton-maceda-2026', raceName: 'Media Maratón de Maceda', eventName: '10K popular', startsAt: '2026-09-27T10:00:00+02:00', location: 'Maceda, Ourense', participantName: 'Iria Varela', bibNumber: 184, paidState: 'paid', total: 14, imageUrl: '/images/race-stone-town.png' },
  { id: 'registration-2', raceSlug: 'carreira-da-ribeira-sacra-2026', raceName: 'Carreira da Ribeira Sacra', eventName: 'Carreira 15K', startsAt: '2026-11-08T10:00:00+01:00', location: 'Monforte de Lemos, Lugo', participantName: 'Iria Varela', paidState: 'pending', total: 18, imageUrl: '/images/hero-running-galicia.png' },
];
