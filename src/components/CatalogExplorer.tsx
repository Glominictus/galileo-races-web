import { useMemo, useState } from 'react';
import type { RaceSummary, RaceType } from '@/lib/race-portal/types';
import { formatMoney, formatShortDate, statusCopy } from '@/lib/format';

interface Props { initialRaces: RaceSummary[]; provinces: string[]; }

export default function CatalogExplorer({ initialRaces, provinces }: Props) {
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState<RaceType | ''>('');
  const [onlyOpen, setOnlyOpen] = useState(false);

  const races = useMemo(() => initialRaces.filter((race) => {
    const term = query.trim().toLocaleLowerCase('es');
    return (!term || [race.name, race.city, race.province].some((value) => value.toLocaleLowerCase('es').includes(term)))
      && (!province || race.province === province)
      && (!type || race.type === type)
      && (!onlyOpen || race.status === 'open');
  }), [initialRaces, query, province, type, onlyOpen]);

  const clear = () => { setQuery(''); setProvince(''); setType(''); setOnlyOpen(false); };

  return <div className="catalog-app">
    <form className="catalog-filters" onSubmit={(event) => event.preventDefault()}>
      <label className="search-field"><span>Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, localidad…" /><b aria-hidden="true">⌕</b></label>
      <label><span>Provincia</span><select value={province} onChange={(event) => setProvince(event.target.value)}><option value="">Todas</option>{provinces.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label><span>Terreno</span><select value={type} onChange={(event) => setType(event.target.value as RaceType | '')}><option value="">Todos</option><option value="asfalto">Asfalto</option><option value="trail">Trail</option><option value="andaina">Andaina</option></select></label>
      <label className="check-field"><input type="checkbox" checked={onlyOpen} onChange={(event) => setOnlyOpen(event.target.checked)} /><span>Solo abiertas</span></label>
    </form>
    <div className="catalog-summary" aria-live="polite"><p><strong>{races.length}</strong> pruebas encontradas</p>{(query || province || type || onlyOpen) && <button className="text-button" onClick={clear}>Limpiar filtros</button>}</div>
    {races.length === 0 ? <div className="empty-state"><span>0</span><h2>No hay una carrera aquí todavía.</h2><p>Prueba otra provincia o limpia los filtros.</p><button className="button button--dark" onClick={clear}>Ver todas</button></div> :
      <div className="race-list">{races.map((race, index) => <article className="race-row" key={race.id}>
        <a className="race-row__image" href={`/carreras/${race.slug}`} aria-label={`Ver ${race.name}`}><img src={race.imageUrl} alt="" /><span className="race-row__number">{String(index + 1).padStart(2, '0')}</span></a>
        <div className="race-row__content"><div className="race-row__eyebrow"><span>{formatShortDate(race.startsAt)}</span><span>{race.city} · {race.province}</span></div><h3><a href={`/carreras/${race.slug}`}>{race.name}</a></h3><div className="race-row__meta"><span>{race.distanceLabel}</span><span>Desde {formatMoney(race.priceFrom)}</span></div><div className={`status status--${race.status}`}><i />{statusCopy[race.status]}</div></div>
        <a className="round-link" href={`/carreras/${race.slug}`} aria-label={`Abrir ${race.name}`}><span>↗</span></a>
      </article>)}</div>}
  </div>;
}
