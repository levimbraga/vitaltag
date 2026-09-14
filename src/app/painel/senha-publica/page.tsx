import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/app/_lib/sessao";
import { casosDeUso } from "@/infrastructure/container";
import { FormularioSenhaPublica } from "./formulario-senha-publica";

export const metadata: Metadata = { title: "Senha de acesso público · VitalTag" };

export default async function PaginaSenhaPublica() {
  const usuario = await exigirUsuario();
  if (!(await casosDeUso().obterFichaDoTitular.executar(usuario.id))) redirect("/painel/ficha/nova");

  return <FormularioSenhaPublica />;
}
