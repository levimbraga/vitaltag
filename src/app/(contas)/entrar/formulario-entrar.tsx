"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/components/aviso";
import { BotaoEnviar, CLASSE_BOTAO_GRANDE } from "@/components/formulario/botao-enviar";
import { Campo } from "@/components/formulario/campo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { entrar } from "../acoes";

function caminhoInterno(url: string | undefined): string {
  if (!url) return "";
  try {
    const { pathname, search } = new URL(url, "http://interno");
    return `${pathname}${search}`;
  } catch {
    return "";
  }
}

export function FormularioEntrar({
  senhaRedefinida,
  destino,
}: {
  senhaRedefinida: boolean;
  destino?: string;
}) {
  const [estado, acao] = useActionState(entrar, {});

  return (
    <form action={acao} className="flex flex-col gap-[18px]" noValidate>
      {senhaRedefinida && !estado.mensagem && (
        <Aviso tom="sucesso">Senha redefinida. Entre com a nova senha.</Aviso>
      )}
      {estado.mensagem && <Aviso tom="erro">{estado.mensagem}</Aviso>}

      <input type="hidden" name="destino" value={caminhoInterno(destino)} />
      <Campo
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={estado.valores?.email}
        placeholder="voce@exemplo.com"
      />
      <Campo id="senha" rotulo="Senha" type="password" autoComplete="current-password" required />

      <Link
        href="/recuperar-senha"
        className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Esqueci minha senha
      </Link>

      <div className="mt-2 flex flex-col gap-[18px]">
        <BotaoEnviar textoPendente="Entrando…">Entrar</BotaoEnviar>
        <Link
          href="/cadastro"
          className={cn(
            buttonVariants({ variant: "outline" }),
            CLASSE_BOTAO_GRANDE,
            "border-primary/20 bg-card text-primary hover:bg-secondary",
          )}
        >
          Criar uma conta
        </Link>
      </div>
    </form>
  );
}
