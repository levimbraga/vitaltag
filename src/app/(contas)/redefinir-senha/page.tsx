import type { Metadata } from "next";
import Link from "next/link";
import { Aviso } from "@/components/aviso";
import { CabecalhoConta } from "../cabecalho-conta";
import { FormularioRedefinirSenha } from "./formulario-redefinir-senha";

export const metadata: Metadata = { title: "Nova senha · VitalTag" };

export default async function PaginaRedefinirSenha({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <Link
        href="/entrar"
        className="mb-8 self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Voltar
      </Link>
      <CabecalhoConta
        titulo="Criar nova senha"
        descricao="Escolha uma nova senha. Ao salvar, todas as sessões abertas da sua conta serão encerradas."
      />
      {token ? (
        <FormularioRedefinirSenha token={token} />
      ) : (
        <Aviso tom="erro">
          Link de redefinição incompleto.{" "}
          <Link href="/recuperar-senha" className="font-medium underline">
            Solicite um novo link
          </Link>
          .
        </Aviso>
      )}
    </>
  );
}
