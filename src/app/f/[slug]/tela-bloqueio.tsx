"use client";

import { useEffect, useState } from "react";

function formatarContagem(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  return `${String(minutos).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
}

// A contagem parte dos segundos calculados pelo servidor, e não do relógio do
// aparelho, que pode estar adiantado ou atrasado.
export function TelaBloqueio({ segundosRestantes }: { segundosRestantes: number }) {
  const [inicio] = useState(() => Date.now());
  const [agora, setAgora] = useState(inicio);
  const restante = Math.max(0, segundosRestantes - Math.floor((agora - inicio) / 1000));

  useEffect(() => {
    if (restante <= 0) {
      const recarga = setTimeout(() => window.location.reload(), 1000);
      return () => clearTimeout(recarga);
    }
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [restante]);

  return (
    <section aria-labelledby="titulo-bloqueio" className="flex flex-col items-center gap-4 text-center">
      <span
        aria-hidden
        className="flex h-[38px] w-[52px] items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground"
      >
        V
      </span>
      <h1 id="titulo-bloqueio" className="text-[28px] leading-tight font-bold tracking-tight">
        Acesso bloqueado
      </h1>
      <p className="text-[15px] text-muted-foreground">Foram feitas 5 tentativas incorretas seguidas.</p>

      <div className="mt-2 w-full rounded-2xl border bg-card p-[18px] text-left">
        <p className="text-lg font-semibold">
          Tente novamente em <span role="timer" data-contagem className="font-mono">{formatarContagem(restante)}</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          O titular da ficha foi notificado por e-mail sobre este bloqueio.
        </p>
      </div>

      <p className="w-full rounded-xl bg-emergencia-suave px-4 py-3.5 text-sm font-medium text-emergencia">
        Em caso de emergência, ligue 192 (SAMU).
      </p>
    </section>
  );
}
