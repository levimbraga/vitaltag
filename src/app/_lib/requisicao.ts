interface Cabecalhos {
  get(nome: string): string | null;
}

// Na Vercel o IP do visitante chega no primeiro item de x-forwarded-for.
export function ipDaRequisicao(cabecalhos: Cabecalhos): string {
  const encaminhado = cabecalhos.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = encaminhado || cabecalhos.get("x-real-ip")?.trim() || "";
  // Endereços IPv4 mapeados em IPv6 (::ffff:1.2.3.4) viram IPv4 comum.
  return ip.replace(/^::ffff:/i, "");
}

export function segundosAte(data: Date): number {
  return Math.max(1, Math.ceil((data.getTime() - Date.now()) / 1000));
}
