"use client";

import { useActionState, useRef, useState } from "react";
import { Aviso } from "@/components/aviso";
import { CLASSE_BOTAO_GRANDE, CLASSE_BOTAO_PERIGO_CONTORNO, CLASSE_LINK_CONTORNO } from "@/components/estilos";
import { Campo } from "@/components/formulario/campo";
import { cn } from "@/lib/utils";
import { excluirFicha } from "./ficha/acoes";

const PALAVRA_CONFIRMACAO = "EXCLUIR";

export function DialogoExcluirFicha() {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [texto, setTexto] = useState("");
  const [estado, acao, pendente] = useActionState(excluirFicha, {});
  const confirmado = texto.trim().toUpperCase() === PALAVRA_CONFIRMACAO;

  return (
    <>
      <button type="button" className={CLASSE_BOTAO_PERIGO_CONTORNO} onClick={() => dialogo.current?.showModal()}>
        Excluir ficha
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby="titulo-excluir"
        aria-describedby="aviso-excluir"
        onClose={() => setTexto("")}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-2xl border bg-background p-6 text-foreground backdrop:bg-[#1a1a2e]/55"
      >
        <form action={acao} className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-2">
            <h2 id="titulo-excluir" className="text-2xl font-bold tracking-tight">
              Excluir ficha clínica
            </h2>
            <p id="aviso-excluir" className="text-[15px] font-medium text-destructive">
              Esta ação é irreversível e não pode ser desfeita.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4 text-sm leading-relaxed">
            <p className="font-semibold">Ao confirmar:</p>
            <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-muted-foreground">
              <li>Seus dados clínicos serão apagados definitivamente do banco.</li>
              <li>O link público passará a exibir uma página de ficha indisponível.</li>
              <li>O QR Code já impresso deixará de funcionar.</li>
              <li>Sua conta será mantida e você poderá cadastrar uma nova ficha.</li>
            </ul>
          </div>

          {estado.mensagem && <Aviso tom="erro">{estado.mensagem}</Aviso>}

          <Campo
            id="confirmacao"
            rotulo={`Digite ${PALAVRA_CONFIRMACAO} para confirmar`}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            erros={estado.erros?.confirmacao}
          />

          <button
            type="submit"
            disabled={!confirmado || pendente}
            aria-busy={pendente}
            className={cn(
              CLASSE_BOTAO_GRANDE,
              "inline-flex items-center justify-center bg-destructive text-white transition-colors outline-none hover:bg-destructive/90 focus-visible:ring-3 focus-visible:ring-destructive/30 disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {pendente ? "Excluindo…" : "Excluir definitivamente"}
          </button>
          <button type="button" className={CLASSE_LINK_CONTORNO} onClick={() => dialogo.current?.close()}>
            Cancelar
          </button>
        </form>
      </dialog>
    </>
  );
}
