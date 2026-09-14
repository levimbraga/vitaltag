export function montarUrl(urlBase: string, caminho: string): string {
  return `${urlBase.replace(/\/+$/, "")}${caminho}`;
}

// O conteúdo do QR Code é exatamente esta URL: nunca carrega a senha pública.
export function urlPublicaDaFicha(urlBase: string, slugPublico: string): string {
  return montarUrl(urlBase, `/f/${slugPublico}`);
}
