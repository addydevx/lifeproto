import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

/**
 * Gets the currently authenticated user's Profile.
 * Redirects to /login if no session exists.
 * Throws if session exists but Profile row is missing (shouldn't happen after signup provisioning).
 */
export async function requireProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: { stats: true },
  });

  if (!profile) {
    // This means auth exists but Profile wasn't provisioned.
    // Possible if signup transaction failed midway. For now, force re-signup.
    redirect("/signup");
  }

  return profile;
}

/**
 * Same as requireProfile but doesn't redirect — returns null if unauthenticated.
 * Useful for pages that want to render differently for logged-out users.
 */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return prisma.profile.findUnique({
    where: { id: user.id },
    include: { stats: true },
  });
}
