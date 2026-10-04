/**
 * POST /api/lead — captura o e-mail do brinde "planilha do estado".
 *
 * Body JSON: { email: string, uf: string, consent: true, hp?: string }
 * - `hp` é honeypot anti-bot: se preenchido, finge sucesso sem gravar.
 * - Grava em KV (binding LEADS) na chave `email|UF` (dedupe natural).
 * - Não envia e-mail algum: o download é liberado na própria página.
 *
 * Setup (1x no dashboard Cloudflare Pages > Settings > Bindings):
 *   KV namespace (ex: IMOVUE_LEADS) com Variable name = LEADS.
 * Sem o binding, responde 503 e o frontend exibe mensagem amigável.
 */

interface Env {
  LEADS?: KVNamespace;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UF_RE = /^[A-Z]{2}$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "payload-invalido" }, 400);
  }

  // Honeypot: bot preenche, humano não. Finge sucesso para não dar pista.
  if (typeof body.hp === "string" && body.hp.trim() !== "") {
    return json({ ok: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const uf = String(body.uf ?? "").trim().toUpperCase();

  if (!EMAIL_RE.test(email) || email.length > 160) {
    return json({ ok: false, error: "email-invalido" }, 400);
  }
  if (!UF_RE.test(uf)) {
    return json({ ok: false, error: "uf-invalida" }, 400);
  }
  if (body.consent !== true) {
    return json({ ok: false, error: "consentimento-obrigatorio" }, 400);
  }
  if (!env.LEADS) {
    return json({ ok: false, error: "indisponivel" }, 503);
  }

  const key = `${email}|${uf}`;
  const existing = await env.LEADS.get(key);
  if (!existing) {
    await env.LEADS.put(
      key,
      JSON.stringify({
        email,
        uf,
        consent: true,
        consentVersion: "planilha-estado-v1",
        createdAt: new Date().toISOString(),
      })
    );
  }
  return json({ ok: true });
};
