import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function consumeRateLimit(input: { action: "opt_in" | "redemption"; maxAttempts: number; windowSeconds?: number }) {
  const windowSeconds = input.windowSeconds ?? 60;
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || headerStore.get("x-real-ip") || "local-development";
  const ipHash = createHash("sha256").update(address).digest("hex");
  const supabase = await createClient();
  const toolName = `rate_limit:${input.action}`;
  const since = new Date(Date.now() - windowSeconds * 1000).toISOString();
  const { count, error } = await supabase
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("tool_name", toolName)
    .gte("created_at", since)
    .contains("detail", { ip_hash: ipHash });

  if (error) return { limited: false };
  if ((count ?? 0) >= input.maxAttempts) return { limited: true };

  await supabase.from("audit_logs").insert({
    actor: "user",
    tool_name: toolName,
    target_type: "request",
    detail: { ip_hash: ipHash, window_seconds: windowSeconds },
    risk_level: "low",
  });
  return { limited: false };
}
