"use client";

import { useEffect } from "react";
import { CLASSE_LINK_PRIMARIO } from "@/components/estilos";

export default function ErroFichaPublica({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section role="alert" className="flex flex-col items-center gap-4 text-center">
      <span
        aria-hidden
        className="flex h-[38px] w-[52px] items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground"
      >
        V
      </span>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">Não foi possível abrir a ficha</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Verifique a conexão de internet e tente novamente.
      </p>
      <button type="button" onClick={reset} className={`${CLASSE_LINK_PRIMARIO} mt-2`}>
        Tentar novamente
      </button>
      <p className="w-full rounded-xl bg-emergencia-suave px-4 py-3.5 text-sm font-medium text-emergencia">
        Em caso de emergência, ligue 192 (SAMU).
      </p>
    </section>
  );
}
