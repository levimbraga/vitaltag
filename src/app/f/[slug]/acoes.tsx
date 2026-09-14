"use server";

import { headers } from "next/headers";
import { casosDeUso } from "@/infrastructure/container";
import { textoDoFormulario } from "@/app/_lib/formulario";
import { ipDaRequisicao, segundosAte } from "@/app/_lib/requisicao";
import { FichaPublicaLiberada } from "../_componentes/ficha-publica-liberada";

export type EstadoAcessoPublico =
  | { status: "inicial" | "senha_vazia" | "senha_incorreta" | "indisponivel" }
  | { status: "bloqueada"; segundosRestantes: number }
  | { status: "liberada"; conteudo: React.ReactNode };

export async function acessarFicha(
  slug: string,
  _: EstadoAcessoPublico,
  formData: FormData,
): Promise<EstadoAcessoPublico> {
  const senha = textoDoFormulario(formData, "senha").trim();
  // Envio vazio não conta como tentativa.
  if (!senha) return { status: "senha_vazia" };

  const cabecalhos = await headers();
  const resultado = await casosDeUso().acessarFichaPublica.executar({
    slug,
    senha,
    ipOrigem: ipDaRequisicao(cabecalhos),
    userAgent: cabecalhos.get("user-agent"),
  });

  switch (resultado.status) {
    case "liberada":
      // A ficha já sai renderizada no servidor; o navegador recebe só o resultado.
      return { status: "liberada", conteudo: <FichaPublicaLiberada ficha={resultado.ficha} /> };
    case "bloqueada":
      return { status: "bloqueada", segundosRestantes: segundosAte(resultado.liberaEm) };
    default:
      return { status: resultado.status };
  }
}
