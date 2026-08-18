export default function Loading() {
  return (
    <main className="loading-page" aria-busy="true" aria-label="Memuatkan permainan">
      <div className="loading-hero skeleton" />
      <div className="loading-cards">{[0, 1, 2].map((item) => <div className="loading-card skeleton" key={item} />)}</div>
    </main>
  );
}
