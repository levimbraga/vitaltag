"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CLASSE_LINK_CONTORNO, CLASSE_LINK_PRIMARIO } from "@/components/estilos";
import { Logo } from "@/components/logo";

export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo className="mb-4" />
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">Algo deu errado</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Não foi possível concluir a operação. Verifique a conexão e tente novamente em instantes.
      </p>
      <div className="mt-4 flex w-full flex-col gap-3">
        <button type="button" onClick={reset} className={CLASSE_LINK_PRIMARIO}>
          Tentar novamente
        </button>
        <Link href="/" className={CLASSE_LINK_CONTORNO}>
          Ir para o início
        </Link>
      </div>
    </main>
  );
}
