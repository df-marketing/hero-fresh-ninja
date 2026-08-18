"use client";

import { useMemo, useState, useTransition } from "react";
import type { Coupon } from "@/lib/data/coupons";
import { createOptIn, type OptIn } from "@/lib/data/optins";
import { redeemCoupon } from "@/lib/data/redemptions";
import type { GameSession } from "@/lib/data/sessions";

export function ClaimPanel({ session, coupons }: { session: GameSession | null; coupons: Coupon[] }) {
  const [optIn, setOptIn] = useState<OptIn | null>(null);
  const [verifiedScore, setVerifiedScore] = useState(session?.score ?? 0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [redeemErrors, setRedeemErrors] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [disabledCoupons, setDisabledCoupons] = useState<Record<string, boolean>>({});
  const [isSubmitting, startSubmitting] = useTransition();
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);

  const eligibleCoupons = useMemo(() => {
    if (!session) return [];
    return coupons
      .filter((coupon) => verifiedScore >= coupon.points_required)
      .sort((a, b) => (b.points_required / Math.max(verifiedScore, 1)) - (a.points_required / Math.max(verifiedScore, 1)));
  }, [coupons, session, verifiedScore]);

  function submitOptIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    setFormError(null);
    startSubmitting(async () => {
      const result = await createOptIn({ name, phone, consentGiven: consent, sessionId: session.id });
      if (result.error || !result.data) {
        setFormError(result.error ?? "Sambungan bermasalah, cuba lagi");
        return;
      }
      setOptIn(result.data);
      setVerifiedScore(result.sessionScore ?? session.score);
    });
  }

  function handleRedeem(coupon: Coupon) {
    if (!session || !optIn) return;
    setPendingCoupon(coupon.id);
    setRedeemErrors((current) => ({ ...current, [coupon.id]: "" }));
    startSubmitting(async () => {
      const result = await redeemCoupon({ sessionId: session.id, optInId: optIn.id, couponId: coupon.id });
      if (result.code) setCodes((current) => ({ ...current, [coupon.id]: result.code! }));
      if (result.error && !result.duplicate) setRedeemErrors((current) => ({ ...current, [coupon.id]: result.error! }));
      if (result.exhausted || result.duplicate || result.code) setDisabledCoupons((current) => ({ ...current, [coupon.id]: true }));
      setPendingCoupon(null);
    });
  }

  return (
    <section className="claim-section" aria-labelledby="coupon-title">
      <div className="section-heading">
        <div><p className="eyebrow">Ganjaran hasil segar</p><h2 id="coupon-title">Kupon untuk anda</h2></div>
        <p>{session ? `Markah semasa: ${verifiedScore}` : "Main dahulu untuk membuka kupon."}</p>
      </div>

      {!session && (
        <div className="coupon-grid preview-grid">
          {coupons.map((coupon) => <CouponPreview key={coupon.id} coupon={coupon} />)}
        </div>
      )}

      {session && !optIn && (
        <div className="optin-card">
          <div>
            <span className="step-number">1</span>
            <h3>Simpan kupon anda</h3>
            <p>Masukkan nama dan nombor telefon untuk membuka kupon yang layak.</p>
          </div>
          <form onSubmit={submitOptIn} noValidate>
            <label>Nama<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Aisyah" autoComplete="name" required minLength={2} /></label>
            <label>No. telefon<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0123456789" inputMode="tel" autoComplete="tel" required /></label>
            <label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /> Saya setuju menerima kupon dan promosi Hero Segar.</label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button dark" disabled={isSubmitting}>{isSubmitting ? <><span className="mini-spinner" /> Menyimpan…</> : "Buka kupon saya"}</button>
          </form>
        </div>
      )}

      {session && optIn && eligibleCoupons.length === 0 && (
        <div className="empty-state"><span>🥬</span><h3>Main lagi untuk buka kupon!</h3><p>Lebih banyak hirisan bermakna lebih banyak penjimatan.</p></div>
      )}

      {session && optIn && eligibleCoupons.length > 0 && (
        <div>
          <div className="claim-ready"><span className="step-number">2</span><div><h3>Pilih ganjaran, {optIn.name}</h3><p>{eligibleCoupons.length} kupon layak berdasarkan markah anda.</p></div></div>
          <div className="coupon-grid">
            {eligibleCoupons.map((coupon, index) => (
              <article className="coupon-card eligible" key={coupon.id}>
                {index === 0 && <span className="best-fit">Padanan terbaik</span>}
                <div className="coupon-points">{coupon.points_required}<small>mata</small></div>
                <h3>{coupon.title_bm}</h3>
                <p>{coupon.description_bm}</p>
                <span className="availability">Tinggal {Math.max(0, coupon.max_redemptions - coupon.redeemed_count)} kupon</span>
                {codes[coupon.id] ? (
                  <div className="coupon-code"><small>Kod kupon anda</small><strong>{codes[coupon.id]}</strong><span>Tunjukkan kod ini semasa pembayaran.</span></div>
                ) : (
                  <button className="redeem-button" disabled={disabledCoupons[coupon.id] || pendingCoupon === coupon.id} onClick={() => handleRedeem(coupon)}>
                    {pendingCoupon === coupon.id ? "Menebus…" : disabledCoupons[coupon.id] ? "Sudah ditebus" : "Tebus kupon"}
                  </button>
                )}
                {redeemErrors[coupon.id] && <p className="form-error" role="alert">{redeemErrors[coupon.id]}</p>}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CouponPreview({ coupon }: { coupon: Coupon }) {
  const exhausted = coupon.redeemed_count >= coupon.max_redemptions;
  return (
    <article className="coupon-card">
      <div className="coupon-points">{coupon.points_required}<small>mata</small></div>
      <h3>{coupon.title_bm}</h3><p>{coupon.description_bm}</p>
      <span className="locked-label">{exhausted ? "Kupon habis" : "Main untuk buka"}</span>
    </article>
  );
}
