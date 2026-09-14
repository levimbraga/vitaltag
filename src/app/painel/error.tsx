"use client";

import { useEffect } from "react";
import { CLASSE_LINK_CONTORNO, CLASSE_LINK_PRIMARIO } from "@/components/estilos";

export default function ErroPainel({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="flex flex-col gap-4 pt-8 text-center">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">Não foi possível carregar</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Houve uma falha ao buscar ou salvar seus dados. Nada foi perdido: tente novamente em instantes.
      </p>
      <div className="mt-2 flex flex-col gap-3">
        <button type="button" onClick={reset} className={CLASSE_LINK_PRIMARIO}>
          Tentar novamente
        </button>
        {/* Navegação completa, para sair de um estado de erro do roteador. */}
        <a href="/painel" className={CLASSE_LINK_CONTORNO}>
          Voltar ao painel
        </a>
      </div>
    </section>
  );
}
