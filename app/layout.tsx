import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hero Segar Ninja",
  description: "Hiris hasil segar dan buka kupon belanja.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ms">
      <body className="antialiased">{children}</body>
    </html>
  );
}
