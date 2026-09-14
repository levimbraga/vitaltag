import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/app/_lib/sessao";
import { casosDeUso } from "@/infrastructure/container";
import { FormularioFicha } from "../../_componentes/formulario-ficha";
import { criarFicha } from "../acoes";

export const metadata: Metadata = { title: "Nova ficha clínica · VitalTag" };

export default async function PaginaNovaFicha() {
  const usuario = await exigirUsuario();
  if (await casosDeUso().obterFichaDoTitular.executar(usuario.id)) redirect("/painel/ficha/editar");

  return (
    <FormularioFicha
      acao={criarFicha}
      titulo="Minha ficha clínica"
      descricao="Estas informações ficam visíveis apenas para quem tiver seu QR Code e a senha de acesso público."
      textoBotao="Salvar ficha"
      pedirSenhaPublica
    />
  );
}
