import type { FichaPublica, ItemFichaPublica } from "@/application/acesso/ficha-publica";
import { formatarData } from "@/application/formatacao";
import { DESCRICAO_TIPO_SANGUINEO, ROTULO_SEXO, ROTULO_TIPO_SANGUINEO } from "@/domain/tipos";
import { cn } from "@/lib/utils";

function linkTelefone(telefone: string): string {
  return `tel:${telefone.replace(/[^\d+]/g, "")}`;
}

function SecaoItens({
  id,
  titulo,
  itens,
  vazio,
  destaque = false,
}: {
  id: string;
  titulo: string;
  itens: ItemFichaPublica[];
  vazio: string;
  destaque?: boolean;
}) {
  const emDestaque = destaque && itens.length > 0;

  return (
    <section
      aria-labelledby={id}
      data-secao={id}
      className={cn("rounded-2xl border bg-card p-4", emDestaque && "border-emergencia/35 bg-emergencia-suave")}
    >
      <h2
        id={id}
        className={cn(
          "text-xs font-semibold tracking-[0.08em] uppercase",
          emDestaque ? "text-emergencia" : "text-muted-foreground",
        )}
      >
        {titulo}
      </h2>
      {itens.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-2">
          {itens.map((item, indice) => (
            <li key={indice} className={cn("flex gap-2 text-[15px]", emDestaque && "font-semibold")}>
              <span aria-hidden>•</span>
              <span>
                {item.descricao}
                {item.observacao && <span className="font-normal text-muted-foreground"> — {item.observacao}</span>}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{vazio}</p>
      )}
    </section>
  );
}

// Renderizada no servidor e devolvida pela ação de acesso: nada da ficha chega
// ao navegador antes da senha correta.
export function FichaPublicaLiberada({ ficha }: { ficha: FichaPublica }) {
  return (
    <article aria-label={`Ficha de emergência de ${ficha.nome} ${ficha.sobrenome}`} className="flex flex-col gap-3.5">
      <header className="rounded-2xl bg-emergencia px-6 py-5 text-white">
        <p className="text-xs font-bold tracking-[0.1em]">EMERGÊNCIA MÉDICA · VITALTAG</p>
        <h1 className="mt-1.5 text-[28px] leading-tight font-bold break-words">
          {ficha.nome} {ficha.sobrenome}
        </h1>
        {ficha.sexo !== "NAO_INFORMADO" && <p className="mt-1 text-sm text-white/85">{ROTULO_SEXO[ficha.sexo]}</p>}
      </header>

      <section
        aria-labelledby="tipo-sanguineo"
        data-secao="tipo-sanguineo"
        className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-[18px]"
      >
        <div>
          <h2 id="tipo-sanguineo" className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Tipo sanguíneo
          </h2>
          <p className="mt-1 text-lg font-semibold">{DESCRICAO_TIPO_SANGUINEO[ficha.tipoSanguineo]}</p>
        </div>
        <p className="flex h-[58px] min-w-[72px] items-center justify-center rounded-xl bg-emergencia-suave px-3 text-[32px] font-bold text-emergencia">
          {ROTULO_TIPO_SANGUINEO[ficha.tipoSanguineo]}
        </p>
      </section>

      <SecaoItens id="alergias" titulo="Alergias" itens={ficha.alergias} vazio="Nenhuma alergia informada." destaque />
      <SecaoItens id="medicamentos" titulo="Medicamentos em uso" itens={ficha.medicamentos} vazio="Nenhum medicamento informado." />
      <SecaoItens id="doencas" titulo="Doenças" itens={ficha.doencas} vazio="Nenhuma doença informada." />
      <SecaoItens id="cirurgias" titulo="Cirurgias realizadas" itens={ficha.cirurgias} vazio="Nenhuma cirurgia informada." />

      <section aria-labelledby="contatos" data-secao="contatos" className="rounded-2xl border bg-card p-4">
        <h2 id="contatos" className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {ficha.contatosEmergencia.length > 1 ? "Contatos de emergência" : "Contato de emergência"}
        </h2>
        <ul className="mt-2 flex flex-col gap-3">
          {ficha.contatosEmergencia.map((contato, indice) => (
            <li key={indice} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold break-words">{contato.nome}</p>
                <p className="text-sm text-muted-foreground">
                  {contato.parentesco} · {contato.telefone}
                </p>
              </div>
              <a
                href={linkTelefone(contato.telefone)}
                aria-label={`Ligar para ${contato.nome}`}
                className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Ligar
              </a>
            </li>
          ))}
        </ul>
      </section>

      <p className="px-2 text-center text-[13px] leading-relaxed text-muted-foreground">
        Dados informados pelo titular e atualizados em {formatarData(ficha.atualizadaEm)}. Este acesso
        foi registrado.
      </p>
    </article>
  );
}
