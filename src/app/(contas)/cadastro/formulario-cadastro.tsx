"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/components/aviso";
import { BotaoEnviar } from "@/components/formulario/botao-enviar";
import { Campo } from "@/components/formulario/campo";
import { cadastrar } from "../acoes";

export function FormularioCadastro() {
  const [estado, acao] = useActionState(cadastrar, {});

  return (
    <form action={acao} className="flex flex-col gap-[18px]" noValidate>
      {estado.mensagem && <Aviso tom="erro">{estado.mensagem}</Aviso>}

      <Campo
        id="nome"
        rotulo="Nome completo"
        autoComplete="name"
        required
        maxLength={120}
        defaultValue={estado.valores?.nome}
        erros={estado.erros?.nome}
      />
      <Campo
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={estado.valores?.email}
        erros={estado.erros?.email}
      />
      <Campo
        id="senha"
        rotulo="Senha"
        type="password"
        autoComplete="new-password"
        required
        erros={estado.erros?.senha}
        dica="Mínimo de 8 caracteres, com ao menos uma letra e um número."
      />
      <Campo
        id="confirmacao"
        rotulo="Confirmar senha"
        type="password"
        autoComplete="new-password"
        required
        erros={estado.erros?.confirmacao}
      />

      <div className="mt-2 flex flex-col items-center gap-5">
        <BotaoEnviar textoPendente="Criando conta…">Criar conta</BotaoEnviar>
        <p className="text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-medium text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </form>
  );
}
