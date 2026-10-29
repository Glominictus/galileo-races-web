import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { formatDate } from '@/lib/format';
import type { PortalAccount, RaceDetail } from '@/lib/race-portal/types';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';
import type { CheckoutStep, ParticipantFormData } from './checkout/types';
import StepModality from './checkout/StepModality';
import StepParticipant from './checkout/StepParticipant';
import StepReview from './checkout/StepReview';

interface CheckoutDraft {
  modalityId?: string;
  participant?: Partial<ParticipantFormData>;
}

interface Props {
  race: RaceDetail;
  initialAccount?: PortalAccount | null;
  initialModalityId?: string;
}

export default function RaceCheckout({ race, initialAccount, initialModalityId }: Props) {
  const targetModality = initialModalityId
    ? race.modalities.find((item) => item.id === initialModalityId && item.status === 'open')
    : undefined;

  const [draft, setDraft] = useSessionStorage<CheckoutDraft>(`checkout_${race.slug}`, {});

  const [step, setStep] = useState<CheckoutStep>(() => (targetModality ? 'participant' : 'modality'));
  const [modalityId, setModalityId] = useState(
    () => targetModality?.id ?? race.modalities.find((item) => item.status === 'open')?.id ?? race.modalities[0]?.id ?? ''
  );
  const [participant, setParticipant] = useState<ParticipantFormData>({
    firstName: initialAccount?.firstName ?? '',
    lastName: initialAccount?.lastName ?? '',
    documentType: initialAccount?.dni && /^[XYZ]/i.test(initialAccount.dni) ? 'nie' : 'dni',
    document: initialAccount?.dni ?? '',
    birthDate: initialAccount?.birthDate ?? '',
    phone: initialAccount?.phone ?? '',
    club: initialAccount?.club ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const modality = useMemo(
    () => race.modalities.find((item) => item.id === modalityId),
    [race.modalities, modalityId]
  );

  const isModalityComplete = Boolean(modality && modality.status === 'open');
  const isParticipantComplete = Boolean(
    participant.firstName.trim() &&
    participant.lastName.trim() &&
    participant.document.trim() &&
    participant.birthDate.trim() &&
    participant.phone.trim()
  );

  const canGoToParticipant = isModalityComplete;
  const canGoToReview = isModalityComplete && isParticipantComplete;

  function saveDraft(updatedModalityId = modalityId, updatedParticipant = participant) {
    setDraft({ modalityId: updatedModalityId, participant: updatedParticipant });
  }

  function goToStep(target: CheckoutStep) {
    if (target === 'modality') setStep('modality');
    else if (target === 'participant' && canGoToParticipant) setStep('participant');
    else if (target === 'review' && canGoToReview) setStep('review');
  }

  function handleModalitySelect(id: string) {
    setModalityId(id);
    saveDraft(id, participant);
  }

  function handleParticipantChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    const formatted = name === 'document' ? value.toUpperCase().replace(/[\s-]/g, '') : value;
    setParticipant((prev) => {
      const updated = { ...prev, [name]: formatted };
      saveDraft(modalityId, updated);
      return updated;
    });
  }

  function handleParticipantSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const updated: ParticipantFormData = {
      ...participant,
      ...(values as unknown as ParticipantFormData),
      document: (values.document as string)?.toUpperCase().replace(/[\s-]/g, '') || '',
    };
    setParticipant(updated);
    saveDraft(modalityId, updated);
    setStep('review');
  }

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const urlModalityParam = params?.get('modality') || initialModalityId;
    const validUrlModality = urlModalityParam
      ? race.modalities.find((m) => m.id === urlModalityParam && m.status === 'open')
      : undefined;

    if (validUrlModality) {
      setModalityId(validUrlModality.id);
      setStep('participant');
      setDraft((prev) => ({ ...prev, modalityId: validUrlModality.id }));
    } else if (draft.modalityId) {
      setModalityId(draft.modalityId);
    }

    if (draft.participant) {
      setParticipant((prev) => ({
        ...prev,
        ...draft.participant,
        firstName: initialAccount?.firstName || draft.participant?.firstName || '',
        lastName: initialAccount?.lastName || draft.participant?.lastName || '',
        document: initialAccount?.dni || draft.participant?.document || '',
        birthDate: draft.participant?.birthDate || initialAccount?.birthDate || '',
        phone: draft.participant?.phone || initialAccount?.phone || '',
        club: draft.participant?.club || initialAccount?.club || '',
      }));
    }
  }, [race.slug, race.modalities, initialModalityId, initialAccount]);

  async function handleFinishOrder() {
    if (!modality) return;
    setSubmitting(true);
    setError('');
    saveDraft();

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
      // Ignorar
    }

    window.location.href = result.paymentUrl;
  }

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
          <li className={step === 'modality' ? 'active' : isModalityComplete ? 'completed' : ''}>
            <button
              type="button"
              className="checkout-step-button"
              onClick={() => goToStep('modality')}
            >
              <b>01</b>
              <span>Modalidad</span>
            </button>
          </li>
          <li className={step === 'participant' ? 'active' : isParticipantComplete ? 'completed' : ''}>
            <button
              type="button"
              className="checkout-step-button"
              onClick={() => goToStep('participant')}
              disabled={!canGoToParticipant}
            >
              <b>02</b>
              <span>Participante</span>
            </button>
          </li>
          <li className={step === 'review' ? 'active' : ''}>
            <button
              type="button"
              className="checkout-step-button"
              onClick={() => goToStep('review')}
              disabled={!canGoToReview}
            >
              <b>03</b>
              <span>Revisión</span>
            </button>
          </li>
        </ol>

        <div className="checkout-note">
          <strong>Pago seguro Galileo</strong>
          <p>Validamos tu plaza y generamos el dorsal oficial antes de pasar a la pasarela bancaria.</p>
        </div>
      </aside>

      <section className="checkout-main">
        {step === 'modality' && (
          <StepModality
            modalities={race.modalities}
            selectedModalityId={modalityId}
            onSelectModality={handleModalitySelect}
            onContinue={() => setStep('participant')}
          />
        )}

        {step === 'participant' && (
          <StepParticipant
            raceSlug={race.slug}
            initialAccount={initialAccount}
            participant={participant}
            onChange={handleParticipantChange}
            onSubmit={handleParticipantSubmit}
            onBack={() => setStep('modality')}
            onSaveDraft={saveDraft}
          />
        )}

        {step === 'review' && modality && (
          <StepReview
            raceName={race.name}
            modality={modality}
            participant={participant}
            accepted={accepted}
            onAcceptChange={setAccepted}
            submitting={submitting}
            error={error}
            onBack={() => setStep('participant')}
            onSubmitOrder={handleFinishOrder}
          />
        )}
      </section>
    </div>
  );
}
