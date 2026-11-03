import { useState, type SyntheticEvent } from 'react';
import BirthdatePicker from '@/components/common/BirthdatePicker';
import type { DocumentType } from '@/lib/race-portal/types';
import { isValidDniOrNie, normalizeDocument } from '@/lib/domain/auth/identity';

interface AuthPanelProps {
  nextUrl?: string;
}

export default function AuthPanel({ nextUrl }: AuthPanelProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [dniValue, setDniValue] = useState('');
  const [dniType, setDniType] = useState<DocumentType>('dni');

  function switchMode(newMode: 'login' | 'register') {
    setMode(newMode);
    setStatus('idle');
    setMessage('');
    setErrorField(null);
  }

  function handleFieldChange(name: string) {
    if (errorField === name) {
      setErrorField(null);
      if (status === 'error') {
        setStatus('idle');
        setMessage('');
      }
    }
  }

  function focusAndHighlight(fieldName: string, errorMsg: string) {
    setErrorField(fieldName);
    setStatus('error');
    setMessage(errorMsg);

    setTimeout(() => {
      if (fieldName === 'birthDate') {
        const pickerSelect = document.querySelector<HTMLSelectElement>('.birthdate-field select');
        if (pickerSelect) {
          pickerSelect.focus();
          pickerSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (fieldName === 'acceptedTerms') {
        const check = document.querySelector<HTMLInputElement>('input[name="acceptedTerms"]');
        if (check) {
          check.focus();
          check.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const input = document.querySelector<HTMLElement>(`[name="${fieldName}"]`);
      if (input) {
        input.focus();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 40);
  }

  function handleDniChange(value: string) {
    handleFieldChange('dni');
    setDniValue(value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 9));
  }

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    setErrorField(null);

    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(form.entries());

    if (mode === 'register') {
      if (!body.firstName || String(body.firstName).trim().length < 2) {
        focusAndHighlight('firstName', 'El nombre debe tener al menos 2 caracteres.');
        return;
      }

      if (!body.lastName || String(body.lastName).trim().length < 2) {
        focusAndHighlight('lastName', 'Los apellidos deben tener al menos 2 caracteres.');
        return;
      }

      const normDni = normalizeDocument(String(body.dni || ''));
      const isFormatValid = dniType === 'nie' ? /^[XYZ]\d{7}[A-Z]$/.test(normDni) : /^\d{8}[A-Z]$/.test(normDni);
      if (!isFormatValid) {
        focusAndHighlight(
          'dni',
          `Introduce un formato válido de ${dniType.toUpperCase()} (ej. ${dniType === 'nie' ? 'X1234567A' : '12345678Z'}).`
        );
        return;
      }

      if (!isValidDniOrNie(normDni)) {
        focusAndHighlight('dni', 'La letra de control del DNI o NIE no es correcta según el algoritmo oficial.');
        return;
      }

      const emailA = String(body.email || '').trim().toLowerCase();
      const emailB = String(body.confirmEmail || '').trim().toLowerCase();
      if (!emailA || !emailA.includes('@')) {
        focusAndHighlight('email', 'Introduce un correo electrónico válido.');
        return;
      }

      if (emailA !== emailB) {
        focusAndHighlight('confirmEmail', 'Los correos electrónicos no coinciden.');
        return;
      }

      const phoneVal = String(body.phone || '').trim();
      if (!phoneVal || phoneVal.length < 9) {
        focusAndHighlight('phone', 'Introduce un teléfono de al menos 9 dígitos.');
        return;
      }

      if (!body.gender) {
        focusAndHighlight('gender', 'Por favor, selecciona una opción de género.');
        return;
      }

      const bdParts = String(body.birthDate || '').split('-');
      if (bdParts.length !== 3 || bdParts.some((p) => !p)) {
        focusAndHighlight('birthDate', 'Indica tu fecha de nacimiento completa (día, mes y año).');
        return;
      }

      const pwd = String(body.password || '');
      if (pwd.length < 8) {
        focusAndHighlight('password', 'La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      if (pwd !== String(body.confirmPassword || '')) {
        focusAndHighlight('confirmPassword', 'Las contraseñas no coinciden.');
        return;
      }

      if (!form.get('acceptedTerms')) {
        focusAndHighlight('acceptedTerms', 'Debes aceptar los términos y condiciones y la política de privacidad.');
        return;
      }
      body.acceptedTerms = true;
    }

    if (mode === 'login') {
      const normDni = normalizeDocument(String(body.dni || ''));
      if (!isValidDniOrNie(normDni)) {
        focusAndHighlight('dni', 'Introduce un DNI o NIE válido con su letra de control correcta.');
        return;
      }
      if (!body.password || String(body.password).length < 8) {
        focusAndHighlight('password', 'La contraseña debe tener al menos 8 caracteres.');
        return;
      }
    }

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        const serverField = (result.field as string) || (
          result.message?.toLowerCase().includes('dni') ? 'dni' :
          result.message?.toLowerCase().includes('contraseña') ? 'password' :
          result.message?.toLowerCase().includes('correo') || result.message?.toLowerCase().includes('email') ? 'email' :
          result.message?.toLowerCase().includes('términos') ? 'acceptedTerms' :
          result.message?.toLowerCase().includes('teléfono') ? 'phone' :
          null
        );

        if (serverField) {
          focusAndHighlight(serverField, result.message ?? 'No pudimos completar el acceso.');
        } else {
          setStatus('error');
          setMessage(result.message ?? 'No pudimos completar el acceso.');
        }
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

      <form
        onSubmit={submit}
        noValidate
        onChange={(e) => {
          const target = e.target as HTMLElement;
          const fieldName = target.getAttribute('name');
          if (fieldName) handleFieldChange(fieldName);
        }}
      >
        {mode === 'register' && (
          <div className="form-grid">
            <label className="auth-field">
              <span>Nombre</span>
              <input
                required
                maxLength={255}
                name="firstName"
                autoComplete="given-name"
                placeholder="Ej. Iria"
                className={errorField === 'firstName' ? 'has-error' : ''}
                aria-invalid={errorField === 'firstName'}
              />
            </label>
            <label className="auth-field">
              <span>Apellidos</span>
              <input
                required
                maxLength={255}
                name="lastName"
                autoComplete="family-name"
                placeholder="Ej. Varela"
                className={errorField === 'lastName' ? 'has-error' : ''}
                aria-invalid={errorField === 'lastName'}
              />
            </label>
          </div>
        )}

        {mode === 'register' ? (
          <div className="form-grid">
            <label className="auth-field">
              <span>Tipo de documento</span>
              <select
                name="dniType"
                value={dniType}
                onChange={(e) => {
                  const val = e.target.value as DocumentType;
                  setDniType(val);
                  setDniValue('');
                  handleFieldChange('dni');
                }}
              >
                <option value="dni">DNI</option>
                <option value="nie">NIE</option>
              </select>
            </label>

            <label className="auth-field">
              <span>Número de documento</span>
              <div className="auth-input-wrap">
                <input
                  required
                  type="text"
                  name="dni"
                  value={dniValue}
                  onChange={(e) => handleDniChange(e.target.value)}
                  placeholder={dniType === 'nie' ? 'X1234567A' : '12345678Z'}
                  autoComplete="username"
                  inputMode="text"
                  className={errorField === 'dni' ? 'has-error' : ''}
                  aria-invalid={errorField === 'dni'}
                />
                <span className="auth-input-badge">
                  {dniType.toUpperCase()}
                </span>
              </div>
            </label>
          </div>
        ) : (
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
                className={errorField === 'dni' ? 'has-error' : ''}
                aria-invalid={errorField === 'dni'}
              />
              <span className="auth-input-badge">ID</span>
            </div>
          </label>
        )}

        {mode === 'register' && (
          <>
            <div className="form-grid">
              <label className="auth-field">
                <span>Correo electrónico</span>
                <input
                  required
                  maxLength={255}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className={errorField === 'email' ? 'has-error' : ''}
                  aria-invalid={errorField === 'email'}
                />
              </label>
              <label className="auth-field">
                <span>Repetir correo</span>
                <input
                  required
                  maxLength={255}
                  type="email"
                  name="confirmEmail"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  className={errorField === 'confirmEmail' ? 'has-error' : ''}
                  aria-invalid={errorField === 'confirmEmail'}
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="auth-field">
                <span>Teléfono móvil</span>
                <input
                  required
                  maxLength={50}
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="600 000 000"
                  className={errorField === 'phone' ? 'has-error' : ''}
                  aria-invalid={errorField === 'phone'}
                />
              </label>
              <label className="auth-field">
                <span>Género</span>
                <select
                  required
                  name="gender"
                  defaultValue=""
                  className={errorField === 'gender' ? 'has-error' : ''}
                  aria-invalid={errorField === 'gender'}
                  onChange={() => handleFieldChange('gender')}
                >
                  <option value="" disabled>
                    Selecciona tu género
                  </option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">No binario / Otro</option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <BirthdatePicker
                required
                showLabel
                label="Fecha de nacimiento"
                name="birthDate"
                hasError={errorField === 'birthDate'}
                onChange={() => handleFieldChange('birthDate')}
              />
              <label className="auth-field">
                <span>País de residencia</span>
                <select name="country" defaultValue="España">
                  <option value="España">España</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Francia">Francia</option>
                  <option value="Andorra">Andorra</option>
                  <option value="Italia">Italia</option>
                  <option value="Reino Unido">Reino Unido</option>
                  <option value="Alemania">Alemania</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
            </div>
          </>
        )}

        <div className={mode === 'register' ? 'form-grid' : ''}>
          <label className="auth-field">
            <div className="auth-field__label-row">
              <span>Contraseña</span>
            </div>
            <div className="auth-input-wrap">
              <input
                required
                minLength={8}
                maxLength={100}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className={errorField === 'password' ? 'has-error' : ''}
                aria-invalid={errorField === 'password'}
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

          {mode === 'register' && (
            <label className="auth-field">
              <div className="auth-field__label-row">
                <span>Repetir contraseña</span>
              </div>
              <div className="auth-input-wrap">
                <input
                  required
                  minLength={8}
                  maxLength={100}
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={errorField === 'confirmPassword' ? 'has-error' : ''}
                  aria-invalid={errorField === 'confirmPassword'}
                />
              </div>
            </label>
          )}
        </div>

        {mode === 'register' && (
          <label className={`legal-check ${errorField === 'acceptedTerms' ? 'has-error' : ''}`}>
            <input
              required
              type="checkbox"
              name="acceptedTerms"
              aria-invalid={errorField === 'acceptedTerms'}
              onChange={() => handleFieldChange('acceptedTerms')}
            />
            <span>
              He leído y acepto los <a href="#" className="text-link">términos y condiciones</a> y la <a href="#" className="text-link">política de privacidad</a>.
            </span>
          </label>
        )}

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
