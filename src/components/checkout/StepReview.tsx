import type { RaceModality } from '@/lib/race-portal/types';
import { formatMoney } from '@/lib/format';
import type { ParticipantFormData } from './types';

interface StepReviewProps {
  raceName: string;
  modality: RaceModality;
  participant: ParticipantFormData;
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  submitting: boolean;
  error?: string;
  onBack: () => void;
  onSubmitOrder: () => void;
}

export default function StepReview({
  raceName,
  modality,
  participant,
  accepted,
  onAcceptChange,
  submitting,
  error,
  onBack,
  onSubmitOrder,
}: StepReviewProps) {
  return (
    <>
      <span className="section-index">03 / 03</span>
      <h2>Una última mirada.</h2>

      <div className="review-block">
        <div>
          <span>Carrera</span>
          <strong>{raceName}</strong>
        </div>
        <div>
          <span>Modalidad</span>
          <strong>
            {modality.name} · {modality.distanceKm.toLocaleString('es-ES')} km
          </strong>
        </div>
        <div>
          <span>Participante</span>
          <strong>
            {participant.firstName} {participant.lastName} ({participant.document})
          </strong>
        </div>
        <div>
          <span>Total</span>
          <strong className="review-total">{formatMoney(modality.priceFrom)}</strong>
        </div>
      </div>

      <label className="legal-check">
        <input
          required
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptChange(event.target.checked)}
        />{' '}
        <span>
          Acepto el reglamento oficial de la prueba y el tratamiento de mis datos para la gestión del dorsal y
          cronometraje.
        </span>
      </label>

      {error && (
        <p className="form-error" role="alert" style={{ marginTop: '1rem' }}>
          {error}
        </p>
      )}

      <div className="button-row">
        <button type="button" className="text-button" onClick={onBack}>
          ← Editar datos
        </button>
        <button
          type="button"
          className="button button--lime"
          disabled={submitting || !accepted}
          onClick={onSubmitOrder}
        >
          {submitting ? 'Creando dorsal…' : 'Ir al pago seguro'} <span>→</span>
        </button>
      </div>
    </>
  );
}
