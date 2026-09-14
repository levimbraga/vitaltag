"use client";

import { MAX_ITENS_POR_REGISTRO } from "@/domain/regras/politicas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ListaDeItens({
  id,
  rotulo,
  placeholder,
  itens,
  aoMudarItens,
  rascunho,
  aoMudarRascunho,
  erros,
}: {
  id: string;
  rotulo: string;
  placeholder: string;
  itens: string[];
  aoMudarItens: (itens: string[]) => void;
  rascunho: string;
  aoMudarRascunho: (texto: string) => void;
  erros?: string[];
}) {
  const adicionar = () => {
    const texto = rascunho.trim();
    if (!texto) return;
    const repetido = itens.some((item) => item.toLowerCase() === texto.toLowerCase());
    if (!repetido && itens.length < MAX_ITENS_POR_REGISTRO) aoMudarItens([...itens, texto]);
    aoMudarRascunho("");
  };

  return (
    <div className="flex flex-col gap-2" data-lista={id}>
      <Label htmlFor={`${id}-novo`} className="text-[13px] font-normal text-muted-foreground">
        {rotulo}
      </Label>

      {itens.length > 0 && (
        <ul aria-label={rotulo} className="flex flex-wrap gap-2">
          {itens.map((item) => (
            <li
              key={item}
              className="flex max-w-full items-center gap-1 rounded-full border bg-card py-1 pr-1 pl-3 text-sm"
            >
              <span className="min-w-0 break-words">{item}</span>
              <button
                type="button"
                aria-label={`Remover ${item}`}
                onClick={() => aoMudarItens(itens.filter((atual) => atual !== item))}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-base text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          id={`${id}-novo`}
          value={rascunho}
          maxLength={200}
          placeholder={placeholder}
          aria-invalid={erros ? true : undefined}
          onChange={(evento) => aoMudarRascunho(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === "Enter" && !evento.nativeEvent.isComposing) {
              evento.preventDefault();
              adicionar();
            }
          }}
          className="h-[46px] min-w-0 flex-1 rounded-xl bg-card px-3.5 text-base md:text-base"
        />
        <button
          type="button"
          onClick={adicionar}
          className="h-[46px] shrink-0 rounded-xl border border-primary/20 bg-card px-4 text-sm font-semibold text-primary outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Adicionar
        </button>
      </div>

      {erros?.[0] && <p className="text-[13px] text-destructive">{erros[0]}</p>}
    </div>
  );
}
