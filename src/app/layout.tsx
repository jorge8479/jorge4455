import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/language";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Night Side Roleplay | MTA:SA RP Server",
  description: "The ultimate MTA:SA roleplay experience. Join Night Side Roleplay for an immersive city life simulation with custom scripts, factions, and more.",
  keywords: ["MTA", "MTA:SA", "Roleplay", "Night Side", "GTA", "San Andreas", "RP Server"],
  openGraph: {
    title: "Night Side Roleplay",
    description: "The ultimate MTA:SA roleplay experience",
    images: ["/images/logofondo.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${bebasNeue.variable} antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
