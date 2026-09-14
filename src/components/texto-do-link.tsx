"use client";

import { useLinkStatus } from "next/link";

// Usado dentro de um <Link>: enquanto a próxima tela carrega, mostra um indicador
// no próprio link clicado, sem trocar a página por um esqueleto.
export function TextoDoLink({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <span className="inline-flex items-center gap-2">
      {children}
      {pending && (
        <>
          <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span role="status" className="sr-only">
            Carregando…
          </span>
        </>
      )}
    </span>
  );
}
