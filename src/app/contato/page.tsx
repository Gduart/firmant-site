import type { Metadata } from "next";
import { ContatoClient } from "./ContatoClient";

const title =
  "Contato | FIRMANT - Agência Digital com IA para Redes Sociais, Vídeos e Soluções Web";
const description =
  "Fale com a FIRMANT e tire dúvidas sobre gestão de redes sociais com IA, vídeos curtos, UGC com avatares, desenvolvimento web/mobile, GEO e consultoria em IA. Atendimento online para todo o Brasil.";
const url = "https://firmant.com.br/contato";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "FIRMANT",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FIRMANT",
  url: "https://firmant.com.br",
  email: "ag.firmant@gmail.com",
  telephone: "+55 11 91491-2488",
  areaServed: "BR",
  address: {
    "@type": "PostalAddress",
    addressCountry: "BR",
  },
  sameAs: [
    "https://www.instagram.com/ag.firmant/",
    "https://web.facebook.com/profile.php?id=61590072505709&locale=pt_BR",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55 11 91491-2488",
    contactType: "customer service",
    areaServed: "BR",
    availableLanguage: "Portuguese",
  },
};

export default function ContatoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
        }}
      />
      <ContatoClient />
    </>
  );
}
