"use server";

import { createClient } from "@/lib/supabase/server";
import { consumeRateLimit } from "@/lib/security/rate-limit";

export async function redeemCoupon(input: {
  sessionId: string;
  optInId: string;
  couponId: string;
}): Promise<{ code: string | null; error: string | null; exhausted?: boolean; duplicate?: boolean }> {
  const rateLimit = await consumeRateLimit({ action: "redemption", maxAttempts: 5 });
  if (rateLimit.limited) return { code: null, error: "Terlalu banyak cubaan, tunggu sebentar" };
  const supabase = await createClient();
  const [{ data: session }, { data: coupon }, { data: optIn }] = await Promise.all([
    supabase.from("game_sessions").select("id,score").eq("id", input.sessionId).single(),
    supabase.from("coupons").select("id,code,points_required,max_redemptions,redeemed_count,is_active,expires_at").eq("id", input.couponId).single(),
    supabase.from("opt_ins").select("id").eq("id", input.optInId).single(),
  ]);

  if (!session || !coupon || !optIn) return { code: null, error: "Maklumat tuntutan tidak lengkap" };
  if (!coupon.is_active || (coupon.expires_at && new Date(coupon.expires_at) <= new Date())) {
    return { code: null, error: "Kupon ini tidak lagi aktif", exhausted: true };
  }
  if (coupon.redeemed_count >= coupon.max_redemptions) {
    return { code: null, error: "Kupon ini telah habis", exhausted: true };
  }
  if (session.score < coupon.points_required) {
    return { code: null, error: "Markah anda belum mencukupi" };
  }

  const { data: existing } = await supabase
    .from("redemptions")
    .select("id,redeemed_code")
    .eq("session_id", input.sessionId)
    .eq("coupon_id", input.couponId)
    .maybeSingle();
  if (existing) return { code: existing.redeemed_code, error: "Kupon ini sudah ditebus untuk sesi ini", duplicate: true };

  const { data: claimed } = await supabase
    .from("coupons")
    .update({ redeemed_count: coupon.redeemed_count + 1 })
    .eq("id", coupon.id)
    .eq("redeemed_count", coupon.redeemed_count)
    .lt("redeemed_count", coupon.max_redemptions)
    .select("id")
    .maybeSingle();
  if (!claimed) return { code: null, error: "Kupon ini telah habis", exhausted: true };

  const { error: redemptionError } = await supabase.from("redemptions").insert({
    opt_in_id: input.optInId,
    coupon_id: coupon.id,
    session_id: input.sessionId,
    points_spent: coupon.points_required,
    redeemed_code: coupon.code,
  });
  if (redemptionError) {
    await supabase.from("coupons").update({ redeemed_count: coupon.redeemed_count }).eq("id", coupon.id).eq("redeemed_count", coupon.redeemed_count + 1);
    return { code: null, error: "Sambungan bermasalah, cuba lagi" };
  }

  return { code: coupon.code, error: null };
}
