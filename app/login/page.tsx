'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  signInWithEmail,
  signInWithPassword,
  signUpWithPassword,
} from './actions';

type Mode = 'link' | 'password';

// El foco no puede depender sólo de `focus:border-accent`: contra el nuevo
// `--pulso-border` (re-derivado en la Tarea 33 contra `elevated`/`surface`)
// el acento da apenas ~1.2:1, casi invisible. `focus-visible:ring-2` dibuja
// un anillo propio de 2px con el color de marca sólido — 4.0:1/4.4:1 contra
// `surface` en claro/oscuro, muy por encima de 3.0:1 — que no compite con el
// borde en reposo para ser visible.
const FIELD =
  'rounded-md border border-border bg-surface-elevated px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent focus-visible:ring-2 focus-visible:ring-accent';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('link');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(
    action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>,
    formData: FormData,
    onSuccess: () => void,
  ) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.error ?? 'Algo salió mal.');
      }
    });
  }

  function handleMagicLink(formData: FormData) {
    run(signInWithEmail, formData, () =>
      setMessage('Te enviamos un enlace. Revisa tu correo.'),
    );
  }

  function handleSignIn(formData: FormData) {
    // La Server Action ya dejó las cookies de sesión; refresh() hace que el
    // middleware las vea y redirija.
    run(signInWithPassword, formData, () => {
      router.refresh();
      router.push('/inicio');
    });
  }

  function handleSignUp(formData: FormData) {
    run(signUpWithPassword, formData, () => {
      router.refresh();
      router.push('/inicio');
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2">
        <span
          aria-hidden
          className="bg-brand-gradient mb-2 grid size-14 place-items-center rounded-xl text-title text-white"
        >
          A
        </span>
        <h1 className="text-display text-text">Avanza</h1>
        <p className="text-body text-text-soft">
          Tus tareas y hábitos en un solo lugar.
        </p>
      </div>

      {mode === 'link' ? (
        <form action={handleMagicLink} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-label text-text">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className={FIELD}
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-brand-gradient rounded-md py-3.5 text-label text-white shadow-glow disabled:opacity-40"
          >
            {pending ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-3">
          <label htmlFor="email" className="text-label text-text">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className={FIELD}
          />
          <label htmlFor="password" className="text-label text-text">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className={FIELD}
          />
          <button
            type="submit"
            formAction={handleSignIn}
            disabled={pending}
            className="bg-brand-gradient rounded-md py-3.5 text-label text-white shadow-glow disabled:opacity-40"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
          <button
            type="submit"
            formAction={handleSignUp}
            disabled={pending}
            className="rounded-md border border-border py-3.5 text-label text-text-soft transition-colors hover:border-accent/90 disabled:opacity-40"
          >
            Crear cuenta
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'link' ? 'password' : 'link');
          setMessage(null);
          setError(null);
        }}
        className="self-start text-label text-text-muted underline"
      >
        {mode === 'link' ? 'Usar contraseña' : 'Usar enlace por correo'}
      </button>

      {message && <p className="text-label text-text">{message}</p>}
      {error && <p className="text-label text-text">{error}</p>}
    </main>
  );
}
