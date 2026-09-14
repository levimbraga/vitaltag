export interface EstadoFormulario {
  mensagem?: string;
  sucesso?: boolean;
  erros?: Partial<Record<string, string[]>>;
  // Valores devolvidos para repreencher o formulário. Senhas nunca voltam.
  valores?: Record<string, string>;
}

export function textoDoFormulario(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

// Aceito apenas caminhos internos, para que o parâmetro não vire redirecionamento aberto.
export function destinoSeguro(destino: string | undefined, padrao = "/painel"): string {
  if (!destino || !destino.startsWith("/") || destino.startsWith("//")) return padrao;
  return destino;
}
