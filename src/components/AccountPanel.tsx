import { useState } from 'react';
import type { PortalAccount } from '@/lib/race-portal/types';

interface AccountPanelProps {
  account: PortalAccount;
}

export default function AccountPanel({ account }: AccountPanelProps) {
  const [loggingOut, setLoggingOut] = useState(false);

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

      <div className="account-card" style={{ marginTop: '2rem' }}>
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
    </div>
  );
}