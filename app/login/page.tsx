'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  signInWithEmail,
  signInWithPassword,
  signUpWithPassword,
} from './actions';

type Mode = 'link' | 'password';

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
      router.push('/hoy');
    });
  }

  function handleSignUp(formData: FormData) {
    run(signUpWithPassword, formData, () => {
      router.refresh();
      router.push('/hoy');
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold">Avanza</h1>
        <p className="text-sm text-neutral-500">
          Tus tareas y hábitos en un solo lugar.
        </p>
      </div>

      {mode === 'link' ? (
        <form action={handleMagicLink} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
          >
            {pending ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
          <label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
          <button
            type="submit"
            formAction={handleSignIn}
            disabled={pending}
            className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
          <button
            type="submit"
            formAction={handleSignUp}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-3 py-2 disabled:opacity-50"
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
        className="self-start text-sm text-neutral-500 underline"
      >
        {mode === 'link' ? 'Usar contraseña' : 'Usar enlace por correo'}
      </button>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </main>
  );
}
