import type { z } from "zod";

export interface EstadoFormulario {
  mensagem?: string;
  sucesso?: boolean;
  erros?: Partial<Record<string, string[]>>;
  // Valores devolvidos para repreencher o formulário. Senhas nunca voltam.
  valores?: Record<string, string>;
}

// Erros indexados pelo caminho completo do campo, como "contatosEmergencia.0.telefone",
// para que listas e objetos aninhados mostrem a mensagem no lugar certo.
export function errosPorCampo(erro: z.ZodError): Record<string, string[]> {
  const erros: Record<string, string[]> = {};
  for (const problema of erro.issues) {
    const chave = problema.path.join(".") || "formulario";
    (erros[chave] ??= []).push(problema.message);
  }
  return erros;
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
