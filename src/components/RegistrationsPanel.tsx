import { useEffect, useState } from 'react';
import { formatDate, formatMoney } from '@/lib/format';
import type { Registration } from '@/lib/race-portal/types';

export default function RegistrationsPanel() {
  const [items, setItems] = useState<Registration[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch('/api/account/registrations').then(async (response) => { if (response.status === 401) { window.location.href = '/acceso'; return; } if (!response.ok) { setError(true); return; } setItems(await response.json()); }).catch(() => setError(true)); }, []);
  if (error) return <div className="empty-state"><h2>No pudimos cargar tus carreras.</h2><button className="button button--dark" onClick={() => location.reload()}>Reintentar</button></div>;
  if (!items) return <div className="loading-state"><i /><span>Buscando tus dorsales</span></div>;
  if (!items.length) return <div className="empty-state"><span>0</span><h2>Tu próxima salida empieza aquí.</h2><p>Cuando te inscribas, encontrarás todas tus pruebas en este espacio.</p><a className="button button--dark" href="/carreras">Explorar carreras</a></div>;
  return <div className="registration-list">{items.map((item) => <article className="registration-row" key={item.id}><img src={item.imageUrl} alt="" /><div><span className="kicker">{formatDate(item.startsAt)} · {item.location}</span><h2>{item.raceName}</h2><p>{item.eventName} · {item.participantName}</p></div><div className="registration-ticket"><span className={`payment payment--${item.paidState}`}>{item.paidState === 'paid' ? 'Pagada' : item.paidState === 'pending' ? 'Pago pendiente' : 'Pago fallido'}</span>{item.bibNumber && <strong>Dorsal {item.bibNumber}</strong>}<small>{formatMoney(item.total)}</small></div><a className="round-link" href={`/carreras/${item.raceSlug}`} aria-label={`Ver ${item.raceName}`}>↗</a></article>)}</div>;
}
