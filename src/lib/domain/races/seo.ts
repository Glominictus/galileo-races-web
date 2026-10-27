/**
 * Dominio Carreras: Metadatos estructurados SEO (Schema.org / JSON-LD)
 */

import type { RaceDetail } from '@/lib/race-portal/types';

export function buildRaceJsonLd(race: RaceDetail, siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: race.name,
    startDate: race.startsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [new URL(race.imageUrl, siteUrl).toString()],
    location: {
      '@type': 'Place',
      name: race.locationName,
      address: {
        '@type': 'PostalAddress',
        addressLocality: race.city,
        addressRegion: race.province,
        addressCountry: 'ES',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: race.latitude,
        longitude: race.longitude,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: race.organizer.name,
    },
    offers: race.modalities.map((item) => ({
      '@type': 'Offer',
      price: item.priceFrom,
      priceCurrency: 'EUR',
      availability:
        item.status === 'open'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
      url: new URL(`/inscripcion/${race.slug}`, siteUrl).toString(),
    })),
  };
}
