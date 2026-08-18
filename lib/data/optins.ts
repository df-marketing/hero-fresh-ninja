"use server";

import { createClient } from "@/lib/supabase/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { isValidMalaysianMobile, normalizePhone } from "@/lib/validation/optin";

export type OptIn = {
  id: string;
  name: string;
  phone: string;
  consent_given: boolean;
};

export async function createOptIn(input: {
  name: string;
  phone: string;
  consentGiven: boolean;
  sessionId: string;
}): Promise<{ data: OptIn | null; error: string | null; sessionScore?: number; field?: "name" | "phone" | "consent" }> {
  const name = input.name.trim().replace(/\s+/g, " ");
  const phone = normalizePhone(input.phone);
  const rateLimit = await consumeRateLimit({ action: "opt_in", maxAttempts: 3 });
  if (rateLimit.limited) return { data: null, error: "Terlalu banyak cubaan, tunggu sebentar" };
  if (name.length < 2 || name.length > 80) {
    return { data: null, error: "Masukkan nama yang sah", field: "name" };
  }
  if (!isValidMalaysianMobile(phone)) {
    return { data: null, error: "Masukkan nombor telefon Malaysia yang sah", field: "phone" };
  }
  if (!input.consentGiven) {
    return { data: null, error: "Persetujuan diperlukan untuk menuntut kupon", field: "consent" };
  }

  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("id,score")
    .eq("id", input.sessionId)
    .single();
  if (sessionError || !session) return { data: null, error: "Sesi permainan tidak ditemui" };

  const { data, error } = await supabase
    .from("opt_ins")
    .insert({ name, phone, consent_given: true })
    .select("id,name,phone,consent_given")
    .single();
  if (error || !data) return { data: null, error: "Sambungan bermasalah, cuba lagi" };

  await supabase.from("game_sessions").update({ player_name: name }).eq("id", input.sessionId);
  return { data: data as OptIn, error: null, sessionScore: session.score };
}
