"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createGameSession, type GameSession } from "@/lib/data/sessions";
import { GAME_SECONDS, GROCERIES, STARTING_LIVES, type GroceryDefinition } from "@/lib/game/groceries";

type FlyingItem = GroceryDefinition & {
  key: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
};

type GameStatus = "ready" | "playing" | "saving" | "finished" | "error";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemsRef = useRef<FlyingItem[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const startedAtRef = useRef(0);
  const scoreRef = useRef(0);
  const slicedRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const statusRef = useRef<GameStatus>("ready");
  const itemKeyRef = useRef(0);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [sliced, setSliced] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [session, setSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(bounds.width * ratio);
    canvas.height = Math.floor(bounds.height * ratio);
    const context = canvas.getContext("2d");
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }, []);

  const persistResult = useCallback(async (durationSeconds: number) => {
    statusRef.current = "saving";
    setStatus("saving");
    const result = await createGameSession({
      score: scoreRef.current,
      groceriesSliced: slicedRef.current,
      durationSeconds,
    });
    if (result.error || !result.data) {
      statusRef.current = "error";
      setError(result.error ?? "Sambungan bermasalah, cuba lagi");
      setStatus("error");
      return;
    }
    setSession(result.data);
    statusRef.current = "finished";
    setStatus("finished");
  }, []);

  const endGame = useCallback(() => {
    if (statusRef.current !== "playing") return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    const elapsed = Math.min(GAME_SECONDS, Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
    void persistResult(elapsed);
  }, [persistResult]);

  const spawnItem = useCallback((width: number, height: number) => {
    const safePool = GROCERIES.filter((item) => !item.danger);
    const shouldSpawnDanger = Math.random() < 0.1;
    const definition = shouldSpawnDanger
      ? GROCERIES.find((item) => item.danger)!
      : safePool[Math.floor(Math.random() * safePool.length)];
    const radius = 27;
    itemsRef.current.push({
      ...definition,
      key: itemKeyRef.current++,
      x: radius + Math.random() * Math.max(10, width - radius * 2),
      y: height + radius,
      vx: (Math.random() - 0.5) * 90,
      vy: -(520 + Math.random() * 130),
      radius,
      rotation: Math.random() * Math.PI,
    });
  }, []);

  const drawFrame = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas || statusRef.current !== "playing") return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const delta = Math.min((timestamp - lastFrameRef.current) / 1000 || 0, 0.034);
    lastFrameRef.current = timestamp;
    const elapsed = (Date.now() - startedAtRef.current) / 1000;
    const remaining = Math.max(0, Math.ceil(GAME_SECONDS - elapsed));
    setTimeLeft(remaining);
    if (remaining <= 0 || livesRef.current <= 0) {
      endGame();
      return;
    }

    if (timestamp - lastSpawnRef.current > 380) {
      spawnItem(width, height);
      lastSpawnRef.current = timestamp;
    }

    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#102f25");
    gradient.addColorStop(1, "#081813");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(255,255,255,0.04)";
    for (let i = 0; i < 18; i += 1) {
      context.beginPath();
      context.arc((i * 71) % width, (i * 97) % height, 2, 0, Math.PI * 2);
      context.fill();
    }

    itemsRef.current = itemsRef.current.filter((item) => {
      item.vy += 690 * delta;
      item.x += item.vx * delta;
      item.y += item.vy * delta;
      item.rotation += delta;
      context.save();
      context.translate(item.x, item.y);
      context.rotate(item.rotation);
      context.font = `${item.radius * 1.7}px system-ui`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.shadowColor = item.danger ? "#fb7185" : "rgba(255,255,255,.18)";
      context.shadowBlur = 14;
      context.fillText(item.emoji, 0, 0);
      context.restore();
      return item.y < height + item.radius * 2;
    });

    animationRef.current = requestAnimationFrame(drawFrame);
  }, [endGame, spawnItem]);

  const startGame = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    itemsRef.current = [];
    scoreRef.current = 0;
    slicedRef.current = 0;
    livesRef.current = STARTING_LIVES;
    setScore(0);
    setSliced(0);
    setLives(STARTING_LIVES);
    setTimeLeft(GAME_SECONDS);
    setSession(null);
    setError(null);
    statusRef.current = "playing";
    setStatus("playing");
    startedAtRef.current = Date.now();
    lastFrameRef.current = performance.now();
    lastSpawnRef.current = 0;
    animationRef.current = requestAnimationFrame(drawFrame);
  }, [drawFrame]);

  const sliceAt = useCallback((clientX: number, clientY: number) => {
    if (statusRef.current !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const x = clientX - bounds.left;
    const y = clientY - bounds.top;
    const hit = itemsRef.current.find((item) => Math.hypot(item.x - x, item.y - y) <= item.radius * 1.35);
    if (!hit) return;
    itemsRef.current = itemsRef.current.filter((item) => item.key !== hit.key);
    if (hit.danger) {
      livesRef.current = Math.max(0, livesRef.current - 1);
      setLives(livesRef.current);
      if (livesRef.current <= 0) endGame();
      return;
    }
    scoreRef.current += hit.points;
    slicedRef.current += 1;
    setScore(scoreRef.current);
    setSliced(slicedRef.current);
  }, [endGame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [resizeCanvas]);

  return (
    <section className="game-shell" aria-labelledby="game-title">
      <div className="game-heading">
        <div>
          <p className="eyebrow">Cabaran 60 saat</p>
          <h1 id="game-title">Hero Segar Ninja</h1>
          <p>Hiris hasil segar, elak buah busuk, dan buka kupon belanja.</p>
        </div>
        <div className="scoreboard" aria-live="polite">
          <span><small>Markah</small><strong>{score}</strong></span>
          <span><small>Masa</small><strong>{timeLeft}s</strong></span>
          <span><small>Nyawa</small><strong>{"♥".repeat(lives)}{"♡".repeat(STARTING_LIVES - lives)}</strong></span>
        </div>
      </div>

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            sliceAt(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (event.buttons > 0 || event.pointerType === "touch") sliceAt(event.clientX, event.clientY);
          }}
          aria-label="Kanvas permainan. Seret jari untuk menghiris hasil segar."
        />

        {status === "ready" && (
          <div className="game-overlay">
            <div className="produce-row" aria-hidden="true">🍌 🍅 🌶️ 🟣 🟢</div>
            <h2>Sedia jadi ninja?</h2>
            <p>Seret jari untuk hiris. Jangan sentuh bom—anda ada 3 nyawa.</p>
            <button className="primary-button" onClick={startGame}>Mula bermain</button>
          </div>
        )}

        {status === "saving" && (
          <div className="game-overlay"><div className="spinner" /><h2>Menyimpan markah…</h2></div>
        )}

        {(status === "finished" || status === "error") && (
          <div className="game-overlay result-card">
            <p className="eyebrow">Permainan tamat</p>
            <h2>{score === 0 ? "Cuba lagi!" : `${score} mata!`}</h2>
            <p>Anda menghiris {sliced} hasil segar.</p>
            {session && <p className="saved-note">✓ Markah disimpan · {session.id.slice(0, 8)}</p>}
            {error && <p className="error-note">{error}</p>}
            <div className="button-row">
              {status === "error" && <button className="secondary-button" onClick={() => void persistResult(Math.min(GAME_SECONDS, Math.max(1, GAME_SECONDS - timeLeft)))}>Cuba simpan lagi</button>}
              <button className="primary-button" onClick={startGame}>Main lagi</button>
            </div>
          </div>
        )}
      </div>

      <div className="legend" aria-label="Nilai hasil segar">
        {GROCERIES.map((item) => (
          <span key={item.id}>{item.emoji} {item.label} <strong>{item.danger ? "−1 nyawa" : `+${item.points}`}</strong></span>
        ))}
      </div>
    </section>
  );
}
