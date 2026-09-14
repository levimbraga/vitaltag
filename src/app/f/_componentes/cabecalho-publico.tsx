export function CabecalhoPublico({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <span
        aria-hidden
        className="flex h-[38px] w-[52px] items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground"
      >
        V
      </span>
      <span className="rounded-full bg-emergencia-suave px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-emergencia">
        EMERGÊNCIA MÉDICA
      </span>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">{titulo}</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{descricao}</p>
    </header>
  );
}
