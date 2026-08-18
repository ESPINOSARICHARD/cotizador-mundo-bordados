import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "Demo pública | Cotizador Mundo Bordados",
    description: "Proyecto de portafolio para crear cotizaciones profesionales en PDF y PNG.",
    icons: {
      icon: "/logo-mundo-bordados.jpg",
      shortcut: "/logo-mundo-bordados.jpg",
    },
    openGraph: {
      title: "Cotizador Mundo Bordados · Demo pública",
      description: "Proyecto de portafolio para crear cotizaciones profesionales.",
      images: [{ url: `${origin}/og.png`, width: 1730, height: 909, alt: "Cotizador Mundo Bordados" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Cotizador Mundo Bordados · Demo pública",
      description: "Proyecto de portafolio para crear cotizaciones profesionales.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
