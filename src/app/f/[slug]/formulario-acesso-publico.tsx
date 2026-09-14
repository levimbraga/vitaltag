"use client";

import { useActionState, useMemo, useState } from "react";
import { SENHA_PUBLICA_MAX } from "@/domain/regras/politicas";
import { Aviso } from "@/components/aviso";
import { CLASSE_LINK_PRIMARIO } from "@/components/estilos";
import { CabecalhoPublico } from "../_componentes/cabecalho-publico";
import { acessarFicha, type EstadoAcessoPublico } from "./acoes";
import { TelaBloqueio } from "./tela-bloqueio";

export function FormularioAcessoPublico({
  slug,
  segundosBloqueio,
}: {
  slug: string;
  segundosBloqueio?: number;
}) {
  const acao = useMemo(() => acessarFicha.bind(null, slug), [slug]);
  const estadoInicial: EstadoAcessoPublico = segundosBloqueio
    ? { status: "bloqueada", segundosRestantes: segundosBloqueio }
    : { status: "inicial" };
  const [estado, despachar, pendente] = useActionState(acao, estadoInicial);
  // As senhas geradas pelo sistema são numéricas; o teclado completo fica a um toque.
  const [teclado, setTeclado] = useState<"numeric" | "text">("numeric");

  if (estado.status === "liberada") return <>{estado.conteudo}</>;
  if (estado.status === "bloqueada") return <TelaBloqueio segundosRestantes={estado.segundosRestantes} />;

  return (
    <div className="flex flex-col gap-7">
      <CabecalhoPublico
        titulo="Ficha de emergência"
        descricao="Informe a senha impressa no cartão junto ao QR Code."
      />

      <form action={despachar} className="flex flex-col gap-[18px]">
        {estado.status === "senha_incorreta" && (
          <Aviso tom="erro">Senha incorreta. Confira a senha impressa no cartão e tente novamente.</Aviso>
        )}
        {estado.status === "senha_vazia" && <Aviso tom="erro">Digite a senha impressa no cartão.</Aviso>}
        {estado.status === "indisponivel" && <Aviso tom="erro">Esta ficha não está mais disponível.</Aviso>}

        <label htmlFor="senha" className="sr-only">
          Senha de acesso
        </label>
        <input
          id="senha"
          name="senha"
          type="text"
          inputMode={teclado}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          autoFocus
          maxLength={SENHA_PUBLICA_MAX}
          placeholder="Senha"
          aria-invalid={estado.status === "senha_incorreta" ? true : undefined}
          className="h-[66px] w-full rounded-xl border border-input bg-card text-center font-mono text-3xl tracking-[0.4em] outline-none placeholder:font-sans placeholder:text-lg placeholder:tracking-normal focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
        />

        <button type="submit" disabled={pendente} aria-busy={pendente} className={CLASSE_LINK_PRIMARIO}>
          {pendente ? "Verificando…" : "Ver ficha clínica"}
        </button>

        <button
          type="button"
          onClick={() => setTeclado((atual) => (atual === "numeric" ? "text" : "numeric"))}
          className="self-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {teclado === "numeric" ? "A senha tem letras? Usar teclado completo" : "Usar teclado numérico"}
        </button>

        <p className="text-center text-[13px] leading-relaxed text-muted-foreground">
          Somente o titular pode alterar estes dados. Cada tentativa é registrada, e 5 senhas
          incorretas seguidas bloqueiam o acesso por 15 minutos.
        </p>
      </form>
    </div>
  );
}
