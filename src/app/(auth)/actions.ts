"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(1).optional(),
});

function encodedError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const parsed = authSchema.omit({ displayName: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    encodedError("/login", "Use a valid email and password with at least 8 characters.");
  }

  const credentials = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    encodedError("/login", error.message);
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || undefined,
  });

  if (!parsed.success) {
    encodedError("/signup", "Use a valid email, display name, and password.");
  }

  const credentials = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: {
        display_name: credentials.displayName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  });

  if (error) {
    encodedError("/signup", error.message);
  }

  redirect("/login?message=Check your email if confirmation is enabled, then sign in.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
