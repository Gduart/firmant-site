import { NextResponse } from "next/server";

import { subscribeNewsletter } from "@/lib/newsletter/repository";

const consentText =
  "Autorizo a FIRMANT a enviar novidades, insights e comunicações por e-mail. Posso solicitar remoção a qualquer momento.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.company) {
      return NextResponse.json({ ok: true });
    }

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { error: "Informe um nome válido." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Informe um e-mail válido." },
        { status: 400 },
      );
    }

    await subscribeNewsletter({
      name,
      email,
      source: "contato",
      consentText,
    });

    return NextResponse.json({
      ok: true,
      message: "Cadastro realizado com sucesso.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao cadastrar newsletter.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
