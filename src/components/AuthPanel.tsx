import { useState, type SyntheticEvent } from 'react';

interface AuthPanelProps {
  nextUrl?: string;
}

export default function AuthPanel({ nextUrl }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dniValue, setDniValue] = useState('');

  function switchMode(newMode: 'login' | 'register') {
    setMode(newMode);
    setStatus('idle');
    setMessage('');
  }

  function handleDniChange(value: string) {
    setDniValue(value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 9));
  }

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus('error');
        setMessage(result.message ?? 'No pudimos completar el acceso.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const rawNext = nextUrl || params.get('next') || '';
      const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/cuenta';

      window.location.href = safeNext;
    } catch {
      setStatus('error');
      setMessage('Error de conexión. Inténtalo de nuevo.');
    }
  }

  return (
    <div className="auth-panel">
      <div className="auth-tabs" role="tablist" aria-label="Tipo de acceso">
        <button
          type="button"
          className={mode === 'login' ? 'active' : ''}
          onClick={() => switchMode('login')}
          role="tab"
          aria-selected={mode === 'login'}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'active' : ''}
          onClick={() => switchMode('register')}
          role="tab"
          aria-selected={mode === 'register'}
        >
          Crear cuenta
        </button>
      </div>

      <div className="auth-header">
        <h2>{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta PULSO'}</h2>
        <p>
          {mode === 'login'
            ? 'Introduce tu DNI o NIE para acceder a tus inscripciones y dorsales.'
            : 'Regístrate una sola vez con tu documento oficial para inscribirte en cualquier carrera.'}
        </p>
      </div>

      {nextUrl && (
        <div className="auth-redirect-banner" role="status">
          <p>Inicia sesión o crea tu cuenta para continuar con tu inscripción.</p>
        </div>
      )}

      <form onSubmit={submit} noValidate={false}>
        {mode === 'register' && (
          <div className="form-grid">
            <label className="auth-field">
              <span>Nombre</span>
              <input
                required
                name="firstName"
                autoComplete="given-name"
                placeholder="Ej. Iria"
              />
            </label>
            <label className="auth-field">
              <span>Apellidos</span>
              <input
                required
                name="lastName"
                autoComplete="family-name"
                placeholder="Ej. Varela"
              />
            </label>
          </div>
        )}

        <label className="auth-field">
          <span>DNI / NIE</span>
          <div className="auth-input-wrap">
            <input
              required
              type="text"
              name="dni"
              value={dniValue}
              onChange={(e) => handleDniChange(e.target.value)}
              placeholder="12345678Z"
              autoComplete="username"
              inputMode="text"
              pattern="^([XYZxyz]\d{7}|\d{8})[A-Za-z]$"
              title="Introduce un DNI (8 números y letra) o NIE (X/Y/Z, 7 números y letra)"
            />
            <span className="auth-input-badge">ID</span>
          </div>
        </label>

        {mode === 'register' && (
          <label className="auth-field">
            <span>Correo electrónico</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </label>
        )}

        <label className="auth-field">
          <div className="auth-field__label-row">
            <span>Contraseña</span>
            {mode === 'login' && (
              <small className="auth-field__hint">Mín. 8 caracteres</small>
            )}
          </div>
          <div className="auth-input-wrap">
            <input
              required
              minLength={8}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              autoComplete={
                mode === 'login' ? 'current-password' : 'new-password'
              }
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </label>

        {status === 'error' && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}

        <button
          className="button button--lime button--full auth-submit"
          disabled={status === 'loading'}
        >
          <span>
            {status === 'loading'
              ? 'Verificando documento…'
              : mode === 'login'
              ? 'Entrar con mi DNI'
              : 'Crear mi cuenta PULSO'}
          </span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  );
}