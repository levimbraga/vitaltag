import type { Metadata } from "next";
import Link from "next/link";
import { CabecalhoConta } from "../cabecalho-conta";
import { FormularioRecuperarSenha } from "./formulario-recuperar-senha";

export const metadata: Metadata = { title: "Redefinir senha · VitalTag" };

export default function PaginaRecuperarSenha() {
  return (
    <>
      <Link
        href="/entrar"
        className="mb-8 self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Voltar
      </Link>
      <CabecalhoConta
        titulo="Redefinir senha"
        descricao="Informe o e-mail da sua conta. Enviaremos um link de redefinição válido por 30 minutos."
      />
      <FormularioRecuperarSenha />
    </>
  );
}
