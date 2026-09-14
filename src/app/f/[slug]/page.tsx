import { notFound } from "next/navigation";
import { casosDeUso } from "@/infrastructure/container";
import { CabecalhoPublico } from "../_componentes/cabecalho-publico";

export default async function PaginaFichaPublica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const situacao = await casosDeUso().consultarSituacaoFichaPublica.executar(slug);

  // Ficha excluída, inexistente ou com endereço malformado: HTTP 404.
  if (situacao.status === "indisponivel") notFound();

  return (
    <CabecalhoPublico
      titulo="Ficha de emergência"
      descricao="Informe a senha impressa no cartão junto ao QR Code."
    />
  );
}
