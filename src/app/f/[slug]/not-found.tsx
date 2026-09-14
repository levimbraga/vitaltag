export default function FichaIndisponivel() {
  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <span
        aria-hidden
        className="flex h-[38px] w-[52px] items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground"
      >
        V
      </span>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">Ficha indisponível</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        Esta ficha de emergência não está mais disponível. O titular pode tê-la excluído ou o
        endereço está incorreto.
      </p>
      <p className="mt-2 w-full rounded-xl bg-emergencia-suave px-4 py-3.5 text-sm font-medium text-emergencia">
        Em caso de emergência, ligue 192 (SAMU).
      </p>
    </section>
  );
}
