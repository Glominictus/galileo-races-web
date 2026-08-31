import { useEffect, useState } from 'react';
import type { PortalAccount } from '@/lib/race-portal/types';

export default function AccountPanel() {
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/account').then(async (response) => { if (response.status === 401) { window.location.href = '/acceso'; return; } setAccount(await response.json()); setLoading(false); }); }, []);
  if (loading) return <div className="loading-state"><i /><span>Cargando tu cuenta</span></div>;
  if (!account) return <div className="empty-state"><h2>No pudimos cargar tu cuenta.</h2><a className="button button--dark" href="/acceso">Volver a entrar</a></div>;
  return <div className="account-profile"><div className="account-avatar">{account.firstName[0]}{account.lastName[0]}</div><div><span className="kicker">Cuenta verificada</span><h2>{account.firstName} {account.lastName}</h2><p>{account.email}</p></div><a className="text-link" href="/mis-carreras">Ver mis carreras <span>→</span></a></div>;
}
