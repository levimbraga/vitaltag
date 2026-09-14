"use client";

import { useActionState } from "react";
import { Aviso } from "@/components/aviso";
import { BotaoEnviar } from "@/components/formulario/botao-enviar";
import { Campo } from "@/components/formulario/campo";
import { solicitarRedefinicao } from "../acoes";

export function FormularioRecuperarSenha() {
  const [estado, acao] = useActionState(solicitarRedefinicao, {});

  return (
    <form action={acao} className="flex flex-col gap-[18px]" noValidate>
      <Campo
        id="email"
        rotulo="E-mail cadastrado"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={estado.valores?.email}
        erros={estado.erros?.email}
      />

      <BotaoEnviar textoPendente="Enviando…" className="mt-2">
        Enviar link de redefinição
      </BotaoEnviar>

      {estado.sucesso ? (
        <Aviso tom="sucesso">{estado.mensagem}</Aviso>
      ) : (
        <Aviso>
          Por segurança, a mesma mensagem de confirmação é exibida mesmo que o e-mail não esteja
          cadastrado.
        </Aviso>
      )}
    </form>
  );
}
