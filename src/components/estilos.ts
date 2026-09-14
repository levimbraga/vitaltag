// Classes compartilhadas entre componentes de servidor e de cliente. Ficam fora
// dos módulos "use client" para poderem ser importadas como texto em qualquer lugar.

export const CLASSE_BOTAO_GRANDE = "h-[54px] w-full rounded-xl text-base font-semibold";

const BASE_LINK_BOTAO =
  "inline-flex items-center justify-center border px-4 text-center transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60";

export const CLASSE_LINK_PRIMARIO = `${BASE_LINK_BOTAO} ${CLASSE_BOTAO_GRANDE} border-transparent bg-primary text-primary-foreground hover:bg-primary/85`;

export const CLASSE_LINK_CONTORNO = `${BASE_LINK_BOTAO} ${CLASSE_BOTAO_GRANDE} border-primary/20 bg-card text-primary hover:bg-secondary`;

export const CLASSE_BOTAO_PERIGO_CONTORNO = `${BASE_LINK_BOTAO} ${CLASSE_BOTAO_GRANDE} border-destructive/30 bg-card text-destructive hover:bg-emergencia-suave`;

export const CLASSE_LINK_TEXTO =
  "self-start text-sm font-medium text-primary underline-offset-4 hover:underline";

export const CLASSE_TITULO_SECAO =
  "mt-4 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase";
