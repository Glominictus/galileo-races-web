import type { RaceModality } from '@/lib/race-portal/types';
import { formatMoney, statusCopy } from '@/lib/format';

interface StepModalityProps {
  modalities: RaceModality[];
  selectedModalityId: string;
  onSelectModality: (id: string) => void;
  onContinue: () => void;
}

export default function StepModality({
  modalities,
  selectedModalityId,
  onSelectModality,
  onContinue,
}: StepModalityProps) {
  const selectedModality = modalities.find((item) => item.id === selectedModalityId);
  const canContinue = Boolean(selectedModality && selectedModality.status === 'open');

  return (
    <>
      <span className="section-index">01 / 03</span>
      <h2>Elige tu distancia.</h2>
      <p className="section-lead">La plaza y el precio se reservan al confirmar el pedido.</p>

      <div className="modality-list">
        {modalities.map((item) => (
          <label
            key={item.id}
            className={`modality-option ${selectedModalityId === item.id ? 'selected' : ''} ${
              item.status !== 'open' ? 'disabled' : ''
            }`}
          >
            <input
              type="radio"
              name="modality"
              value={item.id}
              checked={selectedModalityId === item.id}
              disabled={item.status !== 'open'}
              onChange={() => onSelectModality(item.id)}
            />
            <span className="modality-distance">
              {item.distanceKm.toLocaleString('es-ES')}
              <small>km</small>
            </span>
            <span>
              <strong>{item.name}</strong>
              <small>
                {item.status === 'open'
                  ? `${item.availablePlaces} plazas disponibles`
                  : statusCopy[item.status]}
              </small>
            </span>
            <b>{formatMoney(item.priceFrom)}</b>
          </label>
        ))}
      </div>

      <button
        type="button"
        className="button button--dark"
        disabled={!canContinue}
        onClick={onContinue}
      >
        Continuar <span>→</span>
      </button>
    </>
  );
}
