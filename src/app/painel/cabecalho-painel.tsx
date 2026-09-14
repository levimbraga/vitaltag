import { BotaoSair } from "./botao-sair";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${partes[0][0]}${ultima}`.toUpperCase();
}

export function CabecalhoPainel({ nome }: { nome: string }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight">Olá, {nome.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Sua ficha de emergência</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <BotaoSair />
        <span
          aria-hidden
          title={nome}
          className="flex h-8 min-w-10 items-center justify-center rounded-full bg-secondary px-2 text-sm font-semibold text-primary"
        >
          {iniciais(nome)}
        </span>
      </div>
    </header>
  );
}
