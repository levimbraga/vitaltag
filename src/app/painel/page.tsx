import type { Metadata } from "next";
import { exigirUsuario } from "@/app/_lib/sessao";

export const metadata: Metadata = { title: "Painel · VitalTag" };

export default async function PaginaPainel() {
  await exigirUsuario();

  return (
    <section className="rounded-2xl border bg-card p-4">
      <p className="flex items-center gap-2 font-semibold">
        <span aria-hidden className="size-2.5 rounded-full bg-muted-foreground/50" />
        Ficha pendente de preenchimento
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Cadastre sua ficha clínica para gerar o QR Code de emergência.
      </p>
    </section>
  );
}
