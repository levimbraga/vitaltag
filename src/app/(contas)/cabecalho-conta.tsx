export function CabecalhoConta({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <header className="mb-8 flex flex-col gap-3">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">{titulo}</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{descricao}</p>
    </header>
  );
}
