"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="fatal-state">
      <div><span>🥭</span><p className="eyebrow">Sambungan terganggu</p><h1>Permainan belum dapat dimuatkan</h1><p>Sambungan bermasalah. Semak internet anda dan cuba lagi.</p><button className="primary-button dark" onClick={reset}>Cuba lagi</button></div>
    </main>
  );
}
