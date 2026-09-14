"use client";

import { CLASSE_LINK_CONTORNO } from "@/components/estilos";
import { BotaoBaixarCartao } from "./baixar-cartao";

// Exibida uma única vez, logo após a definição da senha pública, com o valor que
// o próprio titular acabou de digitar ou gerar. Depois disso a senha só existe em hash,
// por isso este é o único momento em que o cartão sai sem pedir a senha de novo.
export function ConfirmacaoSenhaPublica({
  titulo,
  descricao,
  senha,
}: {
  titulo: string;
  descricao: string;
  senha: string;
}) {
  return (
    <section aria-labelledby="titulo-confirmacao" className="flex flex-col gap-[18px]">
      <header className="flex flex-col gap-3">
        <h1 id="titulo-confirmacao" className="text-[28px] leading-tight font-bold tracking-tight">
          {titulo}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">{descricao}</p>
      </header>

      <div className="rounded-2xl border bg-card p-5 text-center">
        <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Senha de acesso público
        </p>
        <p data-senha-publica className="mt-2 font-mono text-4xl font-bold tracking-[0.25em] break-all text-primary">
          {senha}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Anote agora. Por segurança, ela não será exibida novamente.
        </p>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-secondary p-4 text-sm leading-relaxed">
        <p className="font-semibold text-primary">Este é o momento mais simples de gerar o cartão.</p>
        <p className="mt-1 text-muted-foreground">
          Enquanto esta tela estiver aberta, o cartão sai com a senha já preenchida. Depois, será
          preciso digitá-la de novo para imprimir.
        </p>
      </div>

      <BotaoBaixarCartao senhaPublica={senha} />

      {/* Navegação completa: o cache do roteador pode guardar o painel de antes do
          cadastro, e esta tela não pode revalidá-lo sem se desmontar. */}
      <a href="/painel" className={CLASSE_LINK_CONTORNO}>
        Ir para o painel
      </a>
    </section>
  );
}
