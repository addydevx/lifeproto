import type { Metadata } from "next";
import { JetBrains_Mono, Rajdhani, Orbitron } from "next/font/google";
import "./globals.css";
import { TelemetryStrip } from "@/components/hud/TelemetryStrip";
import { FloatingXpLayer } from "@/components/hud/FloatingXp";
import { CelebrationOverlay } from "@/components/hud/CelebrationOverlay";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NIGHT//OS — Operator Protocol",
  description: "Turn your life into a game. Track quests, level up, earn rewards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${rajdhani.variable} ${orbitron.variable}`}>
      <body className="font-sans antialiased">
        <div className="ambient-grid-pulse" aria-hidden="true" />
        <div className="ambient-scan" aria-hidden="true" />
        {children}
        <TelemetryStrip />
        <FloatingXpLayer />
        <CelebrationOverlay />
      </body>
    </html>
  );
}
