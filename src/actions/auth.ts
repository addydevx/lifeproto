"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthResult = { error: string } | { success: true };

// --- LOGIN ---------------------------------------------------------------

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Identifier and passphrase required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// --- SIGNUP --------------------------------------------------------------

export async function signupAction(formData: FormData): Promise<AuthResult> {
  const callsign = String(formData.get("callsign") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Validation
  if (!callsign || !email || !password) {
    return { error: "All fields required." };
  }
  if (callsign.length < 3 || callsign.length > 20) {
    return { error: "Callsign must be 3-20 characters." };
  }
  if (!/^[A-Z0-9_]+$/i.test(callsign)) {
    return { error: "Callsign: letters, numbers, underscores only." };
  }
  if (password.length < 8) {
    return { error: "Passphrase must be at least 8 characters." };
  }

  // Check callsign uniqueness BEFORE creating auth user (avoids orphans)
  const existing = await prisma.profile.findUnique({
    where: { callsign: callsign.toUpperCase() },
  });
  if (existing) {
    return { error: "Callsign already taken." };
  }

  // Create Supabase auth user
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { callsign: callsign.toUpperCase() } },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }
  if (!data.user) {
    return { error: "Signup failed — no user returned." };
  }

  // Provision the profile + stats + starter tasks in one transaction
  try {
    await provisionNewOperator(data.user.id, callsign.toUpperCase());
  } catch (err) {
    console.error("Profile provisioning failed:", err);
    return {
      error: "Profile provisioning failed. Try logging in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// --- LOGOUT --------------------------------------------------------------

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// --- Helpers -------------------------------------------------------------

async function provisionNewOperator(userId: string, callsign: string) {
  await prisma.$transaction(async (tx) => {
    // Profile
    await tx.profile.create({
      data: {
        id: userId,
        callsign,
        rank: "INITIATE",
        totalXp: 0,
        streak: 0,
      },
    });

    // Stats
    await tx.stats.create({
      data: {
        profileId: userId,
        health: 10,
        mind: 10,
        discipline: 10,
        social: 10,
      },
    });

    // No starter content — operators define their own directives, quests, and rewards
    // via the in-app creation modals. Fresh-start philosophy.
  });
}

function friendlyAuthError(msg: string): string {
  // Translate raw Supabase errors into HUD-flavored copy
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login")) return "Authentication failed. Check identifier and passphrase.";
  if (lower.includes("user already registered")) return "Identifier already in use.";
  if (lower.includes("email")) return "Identifier rejected: " + msg;
  return msg;
}
