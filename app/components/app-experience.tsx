"use client";

import { useState } from "react";
import { ClaimPanel } from "@/app/components/claim-panel";
import { GameCanvas } from "@/app/components/game-canvas";
import type { Coupon } from "@/lib/data/coupons";
import type { GameSession } from "@/lib/data/sessions";

export function AppExperience({ coupons }: { coupons: Coupon[] }) {
  const [session, setSession] = useState<GameSession | null>(null);
  return <><GameCanvas onSessionSaved={setSession} /><ClaimPanel key={session?.id ?? "preview"} session={session} coupons={coupons} /></>;
}
