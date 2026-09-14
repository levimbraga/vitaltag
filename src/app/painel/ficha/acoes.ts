"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cadastroFichaSchema, dadosFichaSchema } from "@/application/ficha/esquemas";
import {
  ErroFichaJaExiste,
  ErroFichaNaoEncontrada,
  ErroSenhaPublicaIgualSenhaConta,
} from "@/domain/erros";
import { casosDeUso } from "@/infrastructure/container";
import { errosPorCampo, type EstadoFormulario, textoDoFormulario } from "@/app/_lib/formulario";
import { exigirUsuario } from "@/app/_lib/sessao";
import type { EnvioFicha } from "../_componentes/formulario-ficha";

const MENSAGEM_REVISAR = "Revise os campos destacados.";

export async function criarFicha(_: EstadoFormulario, dados: EnvioFicha): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();

  const validacao = cadastroFichaSchema.safeParse(dados);
  if (!validacao.success) {
    return { erros: errosPorCampo(validacao.error), mensagem: MENSAGEM_REVISAR };
  }

  try {
    await casosDeUso().cadastrarFichaClinica.executar(usuario.id, validacao.data);
  } catch (erro) {
    if (erro instanceof ErroSenhaPublicaIgualSenhaConta) {
      return { erros: { senhaPublica: [erro.message] }, mensagem: MENSAGEM_REVISAR };
    }
    if (!(erro instanceof ErroFichaJaExiste)) throw erro;
    redirect("/painel");
  }

  // Sem revalidatePath aqui: ele renderizaria de novo a página de cadastro, que ao
  // encontrar a ficha recém-criada redireciona para a edição e esconderia a
  // confirmação com a senha pública. O painel é dinâmico e busca os dados ao abrir.
  return { sucesso: true };
}

export async function atualizarFicha(_: EstadoFormulario, dados: EnvioFicha): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();

  const validacao = dadosFichaSchema.safeParse(dados);
  if (!validacao.success) {
    return { erros: errosPorCampo(validacao.error), mensagem: MENSAGEM_REVISAR };
  }

  try {
    await casosDeUso().atualizarFichaClinica.executar(usuario.id, validacao.data);
  } catch (erro) {
    if (!(erro instanceof ErroFichaNaoEncontrada)) throw erro;
    redirect("/painel/ficha/nova");
  }

  revalidatePath("/painel");
  redirect("/painel?aviso=ficha-atualizada");
}

export async function excluirFicha(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await exigirUsuario();

  if (textoDoFormulario(formData, "confirmacao").trim().toUpperCase() !== "EXCLUIR") {
    return { erros: { confirmacao: ["Digite EXCLUIR para confirmar."] } };
  }

  try {
    await casosDeUso().excluirFichaClinica.executar(usuario.id, { confirmado: true });
  } catch (erro) {
    if (!(erro instanceof ErroFichaNaoEncontrada)) throw erro;
  }

  revalidatePath("/painel");
  redirect("/painel?aviso=ficha-excluida");
}
