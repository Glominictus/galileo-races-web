import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { RaceSummary } from '@/lib/race-portal/types';
import 'leaflet/dist/leaflet.css';

// Corrección para los iconos de marcadores por defecto en Leaflet con React
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RaceMapProps {
  races: RaceSummary[];
}

export default function RaceMap({ races }: RaceMapProps) {
  // Coordenadas centradas por defecto en el centro de Galicia
  const centerGalicia: [number, number] = [42.6, -7.9];

  // Filtramos carreras que contengan coordenadas válidas
  const validRaces = races.filter((race) => race.latitude && race.longitude);

  return (
    <div style={{ height: '600px', width: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <MapContainer
        center={centerGalicia}
        zoom={8}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validRaces.map((race) => (
          <Marker
            key={race.id}
            position={[race.latitude!, race.longitude!]}
            icon={customIcon}
          >
            <Popup>
              <div style={{ fontFamily: 'sans-serif', padding: '4px', color: '#111' }}>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>{race.name}</strong>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#555' }}>
                 {race.city} · {race.province}
                </p>
                <a
                  href={`/carreras/${race.slug}`}
                  style={{
                    display: 'inline-block',
                    padding: '6px 10px',
                    background: '#050707',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Ver carrera ↗
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}