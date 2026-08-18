"use server";

import { createClient } from "@/lib/supabase/server";

export type GameSession = {
  id: string;
  score: number;
  groceries_sliced: number;
  duration_seconds: number;
  player_name: string | null;
  created_at: string;
};

export async function createGameSession(input: {
  score: number;
  groceriesSliced: number;
  durationSeconds: number;
}): Promise<{ data: GameSession | null; error: string | null }> {
  const score = Math.max(0, Math.floor(input.score));
  const groceriesSliced = Math.max(0, Math.floor(input.groceriesSliced));
  const durationSeconds = Math.min(60, Math.max(0, Math.floor(input.durationSeconds)));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      score,
      groceries_sliced: groceriesSliced,
      duration_seconds: durationSeconds,
    })
    .select("id,score,groceries_sliced,duration_seconds,player_name,created_at")
    .single();

  if (error) {
    return { data: null, error: "Sambungan bermasalah, cuba lagi" };
  }

  return { data: data as GameSession, error: null };
}
