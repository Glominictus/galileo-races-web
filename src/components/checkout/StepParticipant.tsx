import type React from 'react';
import type { PortalAccount } from '@/lib/race-portal/types';
import type { ParticipantFormData } from './types';

interface StepParticipantProps {
  raceSlug: string;
  initialAccount?: PortalAccount | null;
  participant: ParticipantFormData;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

export default function StepParticipant({
  raceSlug,
  initialAccount,
  participant,
  onChange,
  onSubmit,
  onBack,
  onSaveDraft,
}: StepParticipantProps) {
  const loginNextUrl = `/acceso?next=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.pathname : `/inscripcion/${raceSlug}`
  )}`;

  return (
    <>
      <span className="section-index">02 / 03</span>
      <h2>¿Quién corre?</h2>
      <p className="section-lead">
        Estos datos irán al dorsal y deben coincidir con tu documento de identidad.
      </p>

      {initialAccount ? (
        <div className="checkout-auth-badge">
          ✓ Sesión activa con DNI <strong>{initialAccount.dni}</strong>. Datos autocompletados.
        </div>
      ) : (
        <div className="checkout-auth-prompt">
          <p>
            ¿Ya tienes cuenta PULSO?{' '}
            <a href={loginNextUrl} onClick={onSaveDraft}>
              Entra con tu DNI
            </a>{' '}
            para autocompletar tus datos y vincular tu dorsal.
          </p>
        </div>
      )}

      <form className="participant-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <label>
            <span>Nombre</span>
            <input
              required
              name="firstName"
              value={participant.firstName}
              onChange={onChange}
              placeholder="Tu nombre"
            />
          </label>
          <label>
            <span>Apellidos</span>
            <input
              required
              name="lastName"
              value={participant.lastName}
              onChange={onChange}
              placeholder="Tus apellidos"
            />
          </label>
        </div>

        <div className="form-grid form-grid--three">
          <label>
            <span>Documento</span>
            <select
              name="documentType"
              value={participant.documentType}
              onChange={onChange}
            >
              <option value="dni">DNI</option>
              <option value="nie">NIE</option>
              <option value="passport">Pasaporte</option>
            </select>
          </label>
          <label>
            <span>Número</span>
            <input
              required
              name="document"
              value={participant.document}
              onChange={onChange}
              placeholder="12345678Z"
              style={{ textTransform: 'uppercase' }}
            />
          </label>
          <label>
            <span>Nacimiento</span>
            <input
              required
              type="date"
              name="birthDate"
              value={participant.birthDate}
              onChange={onChange}
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            <span>Teléfono</span>
            <input
              required
              type="tel"
              name="phone"
              value={participant.phone}
              onChange={onChange}
              placeholder="600 000 000"
            />
          </label>
          <label>
            <span>
              Club <small>(opcional)</small>
            </span>
            <input
              name="club"
              value={participant.club}
              onChange={onChange}
              placeholder="Nombre de tu club"
            />
          </label>
        </div>

        <div className="button-row">
          <button type="button" className="text-button" onClick={onBack}>
            ← Atrás
          </button>
          <button type="submit" className="button button--dark">
            Revisar inscripción <span>→</span>
          </button>
        </div>
      </form>
    </>
  );
}
