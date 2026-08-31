import { useState, type SyntheticEvent } from 'react';

export default function AuthPanel() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setStatus('loading'); setMessage('');
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setStatus('error'); setMessage(result.message ?? 'No pudimos completar el acceso.'); return; }
    window.location.href = '/cuenta';
  }

  return <div className="auth-panel">
    <div className="auth-tabs" role="tablist"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} role="tab">Entrar</button><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} role="tab">Crear cuenta</button></div>
    <form onSubmit={submit}>
      {mode === 'register' && <div className="form-grid"><label><span>Nombre</span><input required name="firstName" autoComplete="given-name" /></label><label><span>Apellidos</span><input required name="lastName" autoComplete="family-name" /></label></div>}
      <label><span>Email</span><input required type="email" name="email" autoComplete="email" placeholder="tu@email.com" /></label>
      <label><span>Contraseña</span><input required minLength={8} type="password" name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
      {status === 'error' && <p className="form-error" role="alert">{message}</p>}
      <button className="button button--lime button--full" disabled={status === 'loading'}>{status === 'loading' ? 'Un momento…' : mode === 'login' ? 'Entrar en PULSO' : 'Crear mi cuenta'}<span>→</span></button>
    </form>
    <p className="form-note">Demo: utiliza cualquier email y una contraseña de 8 caracteres.</p>
  </div>;
}
