import { useState } from 'react';
import type { PortalAccount } from '@/lib/race-portal/types';
import { formatBirthDate } from '@/lib/format';

interface AccountPanelProps {
  account: PortalAccount;
}

export default function AccountPanel({ account }: AccountPanelProps) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<PortalAccount>(account);
  const [isEditing, setIsEditing] = useState(!account?.phone && !account?.birthDate && !account?.club);
  const [runnerData, setRunnerData] = useState({
    phone: account?.phone ?? '',
    birthDate: account?.birthDate ?? '',
    club: account?.club ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!account) {
    return (
      <div className="empty-state">
        <h2>No pudimos cargar tu cuenta.</h2>
        <a className="button button--dark" href="/acceso">
          Volver a entrar
        </a>
      </div>
    );
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/acceso';
  }

  async function handleSaveRunnerData(e?: React.SyntheticEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runnerData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar');
      }

      const updated = await response.json();
      setCurrentAccount((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      setStatusMsg({ type: 'success', text: '✓ Guardado correctamente' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setStatusMsg({ type: 'error', text: 'No se pudieron guardar los datos' });
    } finally {
      setSaving(false);
    }
  }

  const initials = `${account.firstName?.[0] ?? ''}${account.lastName?.[0] ?? ''}`;

  return (
    <div className="account-panel">
      <div className="account-profile">
        <div className="account-avatar">{initials}</div>
        <div>
          <span className="kicker">Identidad verificada · {account.dni}</span>
          <h2>
            {account.firstName} {account.lastName}
          </h2>
          <p>{account.email}</p>
        </div>
        <div className="account-profile__actions">
          <a className="text-link" href="/mis-carreras">
            Ver mis carreras <span>→</span>
          </a>
          <button
            type="button"
            className="button-logout"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      <div className="account-card" style={{ marginTop: '2.5rem' }}>
        <h3>Datos personales</h3>

        <div className="account-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
          <span className="label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>DNI / NIE (Usuario de acceso)</span>
          <strong>{account.dni ?? 'No registrado'}</strong>
        </div>

        <div className="account-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
          <span className="label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Nombre completo</span>
          <strong>{account.firstName} {account.lastName}</strong>
        </div>

        <div className="account-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
          <span className="label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Correo electrónico</span>
          <strong>{account.email}</strong>
        </div>
      </div>

      <div className="account-card" style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3>Datos para tus inscripciones</h3>
          {!isEditing ? (
            <button
              type="button"
              className="button-edit-account"
              onClick={() => setIsEditing(true)}
            >
              Modificar datos
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="button-edit-account"
                onClick={() => {
                  setRunnerData({
                    phone: currentAccount.phone ?? '',
                    birthDate: currentAccount.birthDate ?? '',
                    club: currentAccount.club ?? '',
                  });
                  setIsEditing(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button--dark"
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
                onClick={() => handleSaveRunnerData()}
                disabled={saving}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          )}
        </div>

        <div className="account-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
          <span className="label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Teléfono habitual</span>
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={runnerData.phone}
              onChange={(e) => setRunnerData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Ej: 600 000 000"
              className="account-row-input"
            />
          ) : (
            <strong>{currentAccount.phone || 'No registrado'}</strong>
          )}
        </div>

        <div className="account-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
          <span className="label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Fecha de nacimiento</span>
          {isEditing ? (
            <input
              type="date"
              name="birthDate"
              value={runnerData.birthDate}
              onChange={(e) => setRunnerData((prev) => ({ ...prev, birthDate: e.target.value }))}
              className="account-row-input"
            />
          ) : (
            <strong>{formatBirthDate(currentAccount.birthDate)}</strong>
          )}
        </div>

        <div className="account-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--line)' }}>
          <span className="label" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Club / Equipo</span>
          {isEditing ? (
            <input
              type="text"
              name="club"
              value={runnerData.club}
              onChange={(e) => setRunnerData((prev) => ({ ...prev, club: e.target.value }))}
              placeholder="Nombre de tu club"
              className="account-row-input"
            />
          ) : (
            <strong>{currentAccount.club || 'No registrado'}</strong>
          )}
        </div>

        {statusMsg && (
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: statusMsg.type === 'success' ? '#16a34a' : '#dc2626',
            }}
          >
            {statusMsg.text}
          </div>
        )}
      </div>
    </div>
  );
}