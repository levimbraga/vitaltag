"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  cadastroUsuarioFormularioSchema,
  redefinirSenhaSchema,
  solicitarRedefinicaoSchema,
} from "@/application/contas/esquemas";
import { ErroEmailJaCadastrado, ErroTokenInvalido } from "@/domain/erros";
import { signIn } from "@/infrastructure/auth/auth";
import { casosDeUso } from "@/infrastructure/container";
import { credencialNaoConfere } from "@/app/_lib/erro-login";
import { destinoSeguro, type EstadoFormulario, textoDoFormulario } from "@/app/_lib/formulario";

const MENSAGEM_CREDENCIAIS_INVALIDAS = "E-mail ou senha incorretos.";

// signIn encerra com um redirecionamento, que o Next.js implementa lançando uma
// exceção própria; por isso só intercepto a credencial que não confere.
async function entrarERedirecionar(email: string, senha: string, destino: string) {
  try {
    await signIn("credentials", { email, senha, redirectTo: destino });
  } catch (erro) {
    if (credencialNaoConfere(erro)) return MENSAGEM_CREDENCIAIS_INVALIDAS;
    // Banco fora do ar ou configuração inválida não podem se passar por senha errada:
    // a falha fica no log e segue para a tela de erro.
    if (erro instanceof AuthError) console.error("Falha interna ao autenticar", erro);
    throw erro;
  }
}

export async function entrar(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const email = textoDoFormulario(formData, "email");
  const destino = destinoSeguro(textoDoFormulario(formData, "destino"));

  const mensagem = await entrarERedirecionar(email, textoDoFormulario(formData, "senha"), destino);
  return { mensagem, valores: { email } };
}

export async function cadastrar(_: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const entrada = {
    nome: textoDoFormulario(formData, "nome"),
    email: textoDoFormulario(formData, "email"),
    senha: textoDoFormulario(formData, "senha"),
    confirmacao: textoDoFormulario(formData, "confirmacao"),
  };
  const valores = { nome: entrada.nome, email: entrada.email };

  const validacao = cadastroUsuarioFormularioSchema.safeParse(entrada);
  if (!validacao.success) {
    return { erros: z.flattenError(validacao.error).fieldErrors, valores };
  }

  try {
    await casosDeUso().cadastrarUsuario.executar(validacao.data);
  } catch (erro) {
    if (erro instanceof ErroEmailJaCadastrado) return { erros: { email: [erro.message] }, valores };
    throw erro;
  }

  const mensagem = await entrarERedirecionar(validacao.data.email, entrada.senha, "/painel");
  return { mensagem, valores };
}

export async function solicitarRedefinicao(
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const email = textoDoFormulario(formData, "email");

  const validacao = solicitarRedefinicaoSchema.safeParse({ email });
  if (!validacao.success) {
    return { erros: z.flattenError(validacao.error).fieldErrors, valores: { email } };
  }

  await casosDeUso().solicitarRedefinicaoSenha.executar(validacao.data);

  return {
    sucesso: true,
    mensagem:
      "Se houver uma conta com este e-mail, enviamos um link para redefinir a senha. Ele vale por 30 minutos.",
  };
}

export async function redefinirSenha(
  _: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const entrada = {
    token: textoDoFormulario(formData, "token"),
    senha: textoDoFormulario(formData, "senha"),
    confirmacao: textoDoFormulario(formData, "confirmacao"),
  };

  const validacao = redefinirSenhaSchema.safeParse(entrada);
  if (!validacao.success) return { erros: z.flattenError(validacao.error).fieldErrors };

  try {
    await casosDeUso().redefinirSenha.executar(validacao.data);
  } catch (erro) {
    if (erro instanceof ErroTokenInvalido) return { mensagem: erro.message };
    throw erro;
  }

  redirect("/entrar?senha=redefinida");
}
