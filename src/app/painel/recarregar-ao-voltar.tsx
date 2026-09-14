"use client";

import { useEffect } from "react";

// Se o navegador restaurar a página do próprio cache ao voltar no histórico,
// recarrego para que o middleware confira a sessão de novo.
export function RecarregarAoVoltar() {
  useEffect(() => {
    const aoExibir = (evento: PageTransitionEvent) => {
      if (evento.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", aoExibir);
    return () => window.removeEventListener("pageshow", aoExibir);
  }, []);

  return null;
}
