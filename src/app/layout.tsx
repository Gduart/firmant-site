import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "@/components/LenisProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CustomCursor } from "@/components/CustomCursor";

const syne = Syne({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FIRMANT — Agência Digital com IA",
  description:
    "Gestão de redes sociais, edição de vídeo, conteúdo UGC com IA e desenvolvimento web/mobile. Tecnologia invisível, resultados visíveis.",
  keywords: [
    "agência digital",
    "inteligência artificial",
    "gestão redes sociais",
    "edição de vídeo",
    "UGC",
    "desenvolvimento web",
    "desenvolvimento mobile",
    "marketing digital",
    "Brasil",
  ],
  authors: [{ name: "FIRMANT" }],
  openGraph: {
    title: "FIRMANT — Agência Digital com IA",
    description:
      "Tecnologia invisível, resultados visíveis. Gestão de redes sociais, vídeo, UGC e desenvolvimento.",
    url: "https://firmant.com.br",
    siteName: "FIRMANT",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${syne.variable} ${jakarta.variable}`}>
      <body>
        <LenisProvider>
          <CustomCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LenisProvider>
      </body>
    </html>
  );
}
