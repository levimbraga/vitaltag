"use client";

import { useFormStatus } from "react-dom";
import { CLASSE_BOTAO_GRANDE } from "@/components/estilos";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BotaoEnviar({
  children,
  textoPendente,
  className,
}: {
  children: React.ReactNode;
  textoPendente: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(CLASSE_BOTAO_GRANDE, className)}
    >
      {pending ? textoPendente : children}
    </Button>
  );
}
