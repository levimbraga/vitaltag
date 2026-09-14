"use client";

import { useState } from "react";
import { SENHA_PUBLICA_MAX, SENHA_PUBLICA_MIN } from "@/domain/regras/politicas";
import { Campo } from "@/components/formulario/campo";
import { Button } from "@/components/ui/button";

const DIGITOS_GERADOS = 6;

// Só dígitos, para abrir o teclado numérico do celular na página pública.
function gerarSenhaAleatoria(): string {
  const valores = crypto.getRandomValues(new Uint32Array(DIGITOS_GERADOS));
  return Array.from(valores, (valor) => String(valor % 10)).join("");
}

export function CampoSenhaPublica({
  valor,
  aoMudar,
  erros,
  rotulo = "Senha de acesso público",
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  erros?: string[];
  rotulo?: string;
}) {
  const [visivel, setVisivel] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Campo
        id="senhaPublica"
        rotulo={rotulo}
        type={visivel ? "text" : "password"}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={SENHA_PUBLICA_MAX}
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        erros={erros}
        dica={`De ${SENHA_PUBLICA_MIN} a ${SENHA_PUBLICA_MAX} letras ou números. É diferente da senha da sua conta e será impressa junto ao cartão do QR Code.`}
        className="font-mono tracking-[0.2em]"
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-primary/20 bg-card text-primary"
          onClick={() => {
            aoMudar(gerarSenhaAleatoria());
            setVisivel(true);
          }}
        >
          Gerar senha aleatória
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-pressed={visivel}
          className="text-muted-foreground"
          onClick={() => setVisivel((atual) => !atual)}
        >
          {visivel ? "Ocultar senha" : "Mostrar senha"}
        </Button>
      </div>
    </div>
  );
}
