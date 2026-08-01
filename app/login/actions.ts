'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { fail, ok, type ActionResult } from '@/lib/result';

const emailSchema = z.string().trim().email('Escribe un correo válido');

const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'La contraseña necesita al menos 8 caracteres'),
});

export async function signInWithEmail(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) {
    return fail(parsed.error.issues[0].message);
  }

  const origin = (await headers()).get('origin');
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return fail('No pudimos enviar el enlace. Intenta de nuevo.');
  }

  return ok();
}

export async function signInWithPassword(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  // Mensaje deliberadamente vago: distinguir "no existe" de "contraseña
  // incorrecta" permitiría averiguar qué correos están registrados.
  if (error) return fail('Correo o contraseña incorrectos.');

  return ok();
}

export async function signUpWithPassword(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const origin = (await headers()).get('origin');
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return fail('No pudimos crear la cuenta. Intenta de nuevo.');

  return ok();
}
