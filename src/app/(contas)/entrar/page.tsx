import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { usuarioDaSessao } from "@/app/_lib/sessao";
import { CabecalhoConta } from "../cabecalho-conta";
import { FormularioEntrar } from "./formulario-entrar";

export const metadata: Metadata = { title: "Entrar · VitalTag" };

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ senha?: string; callbackUrl?: string }>;
}) {
  if (await usuarioDaSessao()) redirect("/painel");
  const { senha, callbackUrl } = await searchParams;

  return (
    <>
      <Logo className="mb-10" />
      <CabecalhoConta
        titulo="Entrar na sua conta"
        descricao="Acesse para gerenciar sua ficha clínica de emergência."
      />
      <FormularioEntrar senhaRedefinida={senha === "redefinida"} destino={callbackUrl} />
    </>
  );
}
