import type { Coupon } from "@/lib/data/coupons";

export function isCouponEligible(coupon: Pick<Coupon, "points_required" | "max_redemptions" | "redeemed_count" | "is_active">, score: number) {
  return coupon.is_active && coupon.redeemed_count < coupon.max_redemptions && score >= coupon.points_required;
}

export function rankCouponsByFit<T extends Pick<Coupon, "points_required">>(coupons: T[], score: number) {
  return [...coupons].sort((a, b) => (b.points_required / Math.max(score, 1)) - (a.points_required / Math.max(score, 1)));
}
