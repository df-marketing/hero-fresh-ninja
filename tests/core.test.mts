import assert from "node:assert/strict";
import test from "node:test";
import { isCouponEligible, rankCouponsByFit } from "../lib/coupons/eligibility.ts";
import { isValidMalaysianMobile, normalizePhone } from "../lib/validation/optin.ts";

test("normalizes common Malaysian phone formats", () => {
  assert.equal(normalizePhone("+60 12-345 6789"), "0123456789");
  assert.equal(normalizePhone("60123456789"), "0123456789");
  assert.equal(normalizePhone("012 345 6789"), "0123456789");
});

test("validates Malaysian mobile numbers", () => {
  assert.equal(isValidMalaysianMobile("0123456789"), true);
  assert.equal(isValidMalaysianMobile("+60123456789"), true);
  assert.equal(isValidMalaysianMobile("12345"), false);
});

test("score exactly equal to threshold is eligible", () => {
  assert.equal(isCouponEligible({ points_required: 500, max_redemptions: 50, redeemed_count: 9, is_active: true }, 500), true);
});

test("inactive and exhausted coupons are ineligible", () => {
  assert.equal(isCouponEligible({ points_required: 100, max_redemptions: 10, redeemed_count: 10, is_active: true }, 500), false);
  assert.equal(isCouponEligible({ points_required: 100, max_redemptions: 10, redeemed_count: 0, is_active: false }, 500), false);
});

test("ranks barely-qualified coupon first", () => {
  const ranked = rankCouponsByFit([{ points_required: 300 }, { points_required: 500 }], 550);
  assert.deepEqual(ranked.map((coupon) => coupon.points_required), [500, 300]);
});
