import { exigirUsuario } from "@/app/_lib/sessao";
import { BotaoSair } from "./botao-sair";
import { RecarregarAoVoltar } from "./recarregar-ao-voltar";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${primeira}${ultima}`.toUpperCase();
}

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  const primeiroNome = usuario.nome.split(" ")[0];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-6 pb-12 pt-12 sm:pt-16">
      <RecarregarAoVoltar />
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight">Olá, {primeiroNome}</p>
          <p className="text-sm text-muted-foreground">Sua ficha de emergência</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <BotaoSair />
          <span
            aria-label={usuario.nome}
            title={usuario.nome}
            className="flex h-8 min-w-10 items-center justify-center rounded-full bg-secondary px-2 text-sm font-semibold text-primary"
          >
            {iniciais(usuario.nome)}
          </span>
        </div>
      </header>
      <main className="flex flex-col gap-[18px]">{children}</main>
    </div>
  );
}
