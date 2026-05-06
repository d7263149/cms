import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DerivData — Live Derivatives",
  description: "Live perpetual contract data",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
