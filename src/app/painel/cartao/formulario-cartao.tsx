"use client";

import Link from "next/link";
import { useState } from "react";
import { SENHA_PUBLICA_MAX } from "@/domain/regras/politicas";
import { CLASSE_LINK_PRIMARIO, CLASSE_LINK_TEXTO } from "@/components/estilos";
import { Campo } from "@/components/formulario/campo";
import { baixarCartaoPdf } from "../_componentes/baixar-cartao";

export function FormularioCartao() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [baixando, setBaixando] = useState(false);

  return (
    <form
      noValidate
      className="flex flex-col gap-[18px]"
      onSubmit={async (evento) => {
        evento.preventDefault();
        setBaixando(true);
        setErro(await baixarCartaoPdf(senha));
        setBaixando(false);
      }}
    >
      <Campo
        id="senhaPublica"
        rotulo="Senha de acesso público"
        type="password"
        autoComplete="off"
        maxLength={SENHA_PUBLICA_MAX}
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        erros={erro ? [erro] : undefined}
        dica="A senha não fica guardada em lugar nenhum. Digite-a para que ela saia impressa no cartão."
        className="font-mono tracking-[0.2em]"
      />
      <button type="submit" disabled={baixando} aria-busy={baixando} className={CLASSE_LINK_PRIMARIO}>
        {baixando ? "Gerando cartão…" : "Baixar PDF do cartão"}
      </button>
      <Link href="/painel/senha-publica" className={CLASSE_LINK_TEXTO}>
        Não lembra a senha? Gere uma nova
      </Link>
    </form>
  );
}
