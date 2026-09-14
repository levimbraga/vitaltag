"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sair } from "./acoes";

export function BotaoSair() {
  const [pendente, iniciar] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pendente}
      className="text-muted-foreground"
      onClick={() =>
        iniciar(async () => {
          await sair();
          window.location.replace("/entrar");
        })
      }
    >
      {pendente ? "Saindo…" : "Sair"}
    </Button>
  );
}
