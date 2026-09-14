"use server";

import { redirect } from "next/navigation";
import { definirSenhaPublicaSchema } from "@/application/ficha/esquemas";
import { ErroFichaNaoEncontrada, ErroSenhaPublicaIgualSenhaConta } from "@/domain/erros";
import { casosDeUso } from "@/infrastructure/container";
import { errosPorCampo, type EstadoFormulario } from "@/app/_lib/formulario";
import { exigirUsuario } from "@/app/_lib/sessao";

export async function definirNovaSenhaPublica(
  _: EstadoFormulario,
  dados: { senhaPublica: string },
): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();

  const validacao = definirSenhaPublicaSchema.safeParse(dados);
  if (!validacao.success) return { erros: errosPorCampo(validacao.error) };

  try {
    await casosDeUso().definirSenhaPublica.executar(usuario.id, validacao.data);
  } catch (erro) {
    if (erro instanceof ErroSenhaPublicaIgualSenhaConta) return { erros: { senhaPublica: [erro.message] } };
    if (!(erro instanceof ErroFichaNaoEncontrada)) throw erro;
    redirect("/painel/ficha/nova");
  }

  return { sucesso: true };
}
