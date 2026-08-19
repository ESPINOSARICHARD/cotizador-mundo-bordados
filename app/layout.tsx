import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cotizador-mundo-bordados-richard-espinosa.vercel.app"),
  title: "Demo pública | Cotizador Mundo Bordados",
  description: "Proyecto de portafolio para crear cotizaciones profesionales en PDF y PNG.",
  icons: {
    icon: "/logo-mundo-bordados.jpg",
    shortcut: "/logo-mundo-bordados.jpg",
  },
  openGraph: {
    title: "Cotizador Mundo Bordados · Demo pública",
    description: "Proyecto de portafolio para crear cotizaciones profesionales.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Cotizador Mundo Bordados" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cotizador Mundo Bordados · Demo pública",
    description: "Proyecto de portafolio para crear cotizaciones profesionales.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
