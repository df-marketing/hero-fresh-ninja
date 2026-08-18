import { createClient } from "@/lib/supabase/server";

export type Coupon = {
  id: string;
  code: string;
  title_bm: string;
  description_bm: string | null;
  points_required: number;
  max_redemptions: number;
  redeemed_count: number;
  is_active: boolean;
  expires_at: string | null;
};

export async function getActiveCoupons(): Promise<Coupon[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("coupons")
    .select("id,code,title_bm,description_bm,points_required,max_redemptions,redeemed_count,is_active,expires_at")
    .eq("is_active", true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("points_required", { ascending: true });

  if (error) throw new Error("Kupon tidak dapat dimuatkan");
  return (data ?? []) as Coupon[];
}
