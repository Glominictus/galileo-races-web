import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { formatDate, formatMoney, statusCopy } from '@/lib/format';
import type { PortalAccount, RaceDetail } from '@/lib/race-portal/types';

interface Props {
  race: RaceDetail;
  initialAccount?: PortalAccount | null;
}

type Step = 'modality' | 'participant' | 'review';

export default function RaceCheckout({ race, initialAccount }: Props) {
  const [step, setStep] = useState<Step>('modality');
  const [modalityId, setModalityId] = useState(
    race.modalities.find((item) => item.status === 'open')?.id ?? race.modalities[0]?.id ?? ''
  );
  const [participant, setParticipant] = useState({
    firstName: initialAccount?.firstName ?? '',
    lastName: initialAccount?.lastName ?? '',
    documentType: (initialAccount?.dni && /^[XYZ]/i.test(initialAccount.dni)) ? 'nie' : 'dni',
    document: initialAccount?.dni ?? '',
    birthDate: '',
    phone: '',
    club: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const modality = useMemo(
    () => race.modalities.find((item) => item.id === modalityId),
    [race.modalities, modalityId]
  );

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`checkout_${race.slug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.modalityId) setModalityId(parsed.modalityId);
        if (parsed.participant) {
          setParticipant((prev) => ({
            ...prev,
            ...parsed.participant,
            firstName: initialAccount?.firstName || parsed.participant.firstName || '',
            lastName: initialAccount?.lastName || parsed.participant.lastName || '',
            document: initialAccount?.dni || parsed.participant.document || '',
          }));
        }
      }
    } catch {
      // Ignore sessionStorage error
    }
  }, [race.slug, initialAccount]);

  function saveParticipant(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const updated = {
      ...participant,
      ...values,
      document: (values.document as string)?.toUpperCase().replace(/[\s-]/g, '') || '',
    };
    setParticipant(updated as typeof participant);
    try {
      sessionStorage.setItem(`checkout_${race.slug}`, JSON.stringify({ modalityId, participant: updated }));
    } catch {
      // Ignore
    }
    setStep('review');
  }

  async function finish() {
    if (!modality) return;
    setSubmitting(true);
    setError('');

    try {
      sessionStorage.setItem(`checkout_${race.slug}`, JSON.stringify({ modalityId, participant }));
    } catch {
      // Ignore
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({ raceSlug: race.slug, modalityId, participant }),
    });

    const result = await response.json();
    if (response.status === 401) {
      window.location.href = `/acceso?next=${encodeURIComponent(location.pathname)}`;
      return;
    }
    if (!response.ok) {
      setSubmitting(false);
      setError(result.message ?? 'No pudimos crear la inscripción.');
      return;
    }

    try {
      sessionStorage.removeItem(`checkout_${race.slug}`);
    } catch {
      // Ignore
    }

    window.location.href = result.paymentUrl;
  }

  const stepNumber = step === 'modality' ? 1 : step === 'participant' ? 2 : 3;

  return (
    <div className="checkout-shell">
      <aside className="checkout-summary">
        <a className="back-link" href={`/carreras/${race.slug}`}>
          ← Volver a la carrera
        </a>
        <span className="kicker">Inscripción oficial</span>
        <h1>{race.name}</h1>
        <p>
          {formatDate(race.startsAt)} · {race.city}
        </p>

        {initialAccount && (
          <div className="checkout-user-pill">
            <span>DNI: {initialAccount.dni}</span>
            <small>{initialAccount.firstName} {initialAccount.lastName}</small>
          </div>
        )}

        <ol className="checkout-steps">
          <li className={stepNumber >= 1 ? 'active' : ''}>
            <b>01</b>
            <span>Modalidad</span>
          </li>
          <li className={stepNumber >= 2 ? 'active' : ''}>
            <b>02</b>
            <span>Participante</span>
          </li>
          <li className={stepNumber >= 3 ? 'active' : ''}>
            <b>03</b>
            <span>Revisión</span>
          </li>
        </ol>

        <div className="checkout-note">
          <strong>Pago seguro Galileo</strong>
          <p>Validamos tu plaza y generamos el dorsal oficial antes de pasar a la pasarela bancaria.</p>
        </div>
      </aside>

      <section className="checkout-main">
        {step === 'modality' && (
          <>
            <span className="section-index">01 / 03</span>
            <h2>Elige tu distancia.</h2>
            <p className="section-lead">La plaza y el precio se reservan al confirmar el pedido.</p>
            <div className="modality-list">
              {race.modalities.map((item) => (
                <label
                  className={`modality-option ${modalityId === item.id ? 'selected' : ''} ${
                    item.status !== 'open' ? 'disabled' : ''
                  }`}
                  key={item.id}
                >
                  <input
                    type="radio"
                    name="modality"
                    value={item.id}
                    checked={modalityId === item.id}
                    disabled={item.status !== 'open'}
                    onChange={() => setModalityId(item.id)}
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
              className="button button--dark"
              disabled={!modality || modality.status !== 'open'}
              onClick={() => setStep('participant')}
            >
              Continuar <span>→</span>
            </button>
          </>
        )}

        {step === 'participant' && (
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
                  <a
                    href={`/acceso?next=${encodeURIComponent(
                      typeof window !== 'undefined' ? window.location.pathname : `/inscripcion/${race.slug}`
                    )}`}
                    onClick={() => {
                      try {
                        sessionStorage.setItem(`checkout_${race.slug}`, JSON.stringify({ modalityId, participant }));
                      } catch {}
                    }}
                  >
                    Entra con tu DNI
                  </a>{' '}
                  para autocompletar tus datos y vincular tu dorsal.
                </p>
              </div>
            )}

            <form className="participant-form" onSubmit={saveParticipant}>
              <div className="form-grid">
                <label>
                  <span>Nombre</span>
                  <input
                    required
                    name="firstName"
                    defaultValue={participant.firstName}
                    placeholder="Tu nombre"
                  />
                </label>
                <label>
                  <span>Apellidos</span>
                  <input
                    required
                    name="lastName"
                    defaultValue={participant.lastName}
                    placeholder="Tus apellidos"
                  />
                </label>
              </div>

              <div className="form-grid form-grid--three">
                <label>
                  <span>Documento</span>
                  <select name="documentType" defaultValue={participant.documentType}>
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
                    defaultValue={participant.document}
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
                    defaultValue={participant.birthDate}
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
                    defaultValue={participant.phone}
                    placeholder="600 000 000"
                  />
                </label>
                <label>
                  <span>
                    Club <small>(opcional)</small>
                  </span>
                  <input name="club" defaultValue={participant.club} placeholder="Nombre de tu club" />
                </label>
              </div>

              <div className="button-row">
                <button type="button" className="text-button" onClick={() => setStep('modality')}>
                  ← Atrás
                </button>
                <button className="button button--dark">
                  Revisar inscripción <span>→</span>
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'review' && modality && (
          <>
            <span className="section-index">03 / 03</span>
            <h2>Una última mirada.</h2>
            <div className="review-block">
              <div>
                <span>Carrera</span>
                <strong>{race.name}</strong>
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
                onChange={(event) => setAccepted(event.target.checked)}
              />{' '}
              <span>
                Acepto el reglamento oficial de la prueba y el tratamiento de mis datos para la gestión
                del dorsal y cronometraje.
              </span>
            </label>

            {error && (
              <p className="form-error" role="alert" style={{ marginTop: '1rem' }}>
                {error}
              </p>
            )}

            <div className="button-row">
              <button
                type="button"
                className="text-button"
                onClick={() => setStep('participant')}
              >
                ← Editar datos
              </button>
              <button
                className="button button--lime"
                disabled={submitting || !accepted}
                onClick={finish}
              >
                {submitting ? 'Creando dorsal…' : 'Ir al pago seguro'} <span>→</span>
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
