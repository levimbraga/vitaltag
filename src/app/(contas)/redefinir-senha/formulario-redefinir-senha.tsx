"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Aviso } from "@/components/aviso";
import { BotaoEnviar } from "@/components/formulario/botao-enviar";
import { Campo } from "@/components/formulario/campo";
import { redefinirSenha } from "../acoes";

export function FormularioRedefinirSenha({ token }: { token: string }) {
  const [estado, acao] = useActionState(redefinirSenha, {});

  return (
    <form action={acao} className="flex flex-col gap-[18px]" noValidate>
      {estado.mensagem && (
        <Aviso tom="erro">
          {estado.mensagem}{" "}
          <Link href="/recuperar-senha" className="font-medium underline">
            Solicitar novo link
          </Link>
        </Aviso>
      )}

      <input type="hidden" name="token" value={token} />
      <Campo
        id="senha"
        rotulo="Nova senha"
        type="password"
        autoComplete="new-password"
        required
        erros={estado.erros?.senha}
        dica="Mínimo de 8 caracteres, com ao menos uma letra e um número."
      />
      <Campo
        id="confirmacao"
        rotulo="Confirmar nova senha"
        type="password"
        autoComplete="new-password"
        required
        erros={estado.erros?.confirmacao}
      />

      <BotaoEnviar textoPendente="Salvando…" className="mt-2">
        Salvar nova senha
      </BotaoEnviar>
    </form>
  );
}
