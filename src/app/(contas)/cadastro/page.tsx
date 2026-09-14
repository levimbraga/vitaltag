import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { usuarioDaSessao } from "@/app/_lib/sessao";
import { CabecalhoConta } from "../cabecalho-conta";
import { FormularioCadastro } from "./formulario-cadastro";

export const metadata: Metadata = { title: "Criar conta · VitalTag" };

export default async function PaginaCadastro() {
  if (await usuarioDaSessao()) redirect("/painel");

  return (
    <>
      <Logo className="mb-10" />
      <CabecalhoConta
        titulo="Criar conta"
        descricao="Seus dados de saúde ficam protegidos e só são exibidos com a senha de acesso público."
      />
      <FormularioCadastro />
    </>
  );
}
