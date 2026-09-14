import { exigirUsuario } from "@/app/_lib/sessao";
import { RecarregarAoVoltar } from "./recarregar-ao-voltar";

export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  await exigirUsuario();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col px-6 pb-12 pt-12 sm:pt-16">
      <RecarregarAoVoltar />
      <main className="flex flex-col gap-[18px]">{children}</main>
    </div>
  );
}
