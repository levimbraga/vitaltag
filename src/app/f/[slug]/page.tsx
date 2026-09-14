import { notFound } from "next/navigation";
import { segundosAte } from "@/app/_lib/requisicao";
import { casosDeUso } from "@/infrastructure/container";
import { FormularioAcessoPublico } from "./formulario-acesso-publico";

export default async function PaginaFichaPublica({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const situacao = await casosDeUso().consultarSituacaoFichaPublica.executar(slug);

  // Ficha excluída, inexistente ou com endereço malformado: HTTP 404.
  if (situacao.status === "indisponivel") notFound();

  return (
    <FormularioAcessoPublico
      slug={slug}
      segundosBloqueio={situacao.status === "bloqueada" ? segundosAte(situacao.liberaEm) : undefined}
    />
  );
}
