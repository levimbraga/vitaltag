"use client";

import { startTransition, useActionState, useState } from "react";
import { CLASSE_BOTAO_GRANDE } from "@/components/estilos";
import { cn } from "@/lib/utils";
import { CabecalhoPagina } from "../_componentes/cabecalho-pagina";
import { CampoSenhaPublica } from "../_componentes/campo-senha-publica";
import { ConfirmacaoSenhaPublica } from "../_componentes/confirmacao-senha-publica";
import { definirNovaSenhaPublica } from "./acoes";

export function FormularioSenhaPublica() {
  const [senhaPublica, setSenhaPublica] = useState("");
  const [estado, despachar, pendente] = useActionState(definirNovaSenhaPublica, {});

  if (estado.sucesso) {
    return (
      <ConfirmacaoSenhaPublica
        titulo="Nova senha definida"
        descricao="A senha anterior deixou de funcionar. Cartões impressos com ela precisam ser refeitos."
        senha={senhaPublica}
      />
    );
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Senha de acesso público"
        descricao="Quem ler o QR Code precisa desta senha para ver sua ficha. Ao definir uma nova, a anterior deixa de funcionar imediatamente."
      />
      <form
        noValidate
        className="flex flex-col gap-[18px]"
        onSubmit={(evento) => {
          evento.preventDefault();
          startTransition(() => despachar({ senhaPublica }));
        }}
      >
        <CampoSenhaPublica
          rotulo="Nova senha de acesso público"
          valor={senhaPublica}
          aoMudar={setSenhaPublica}
          erros={estado.erros?.senhaPublica}
        />
        <button
          type="submit"
          disabled={pendente}
          aria-busy={pendente}
          className={cn(
            CLASSE_BOTAO_GRANDE,
            "mt-2 inline-flex items-center justify-center bg-primary text-primary-foreground transition-colors outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60",
          )}
        >
          {pendente ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </>
  );
}
