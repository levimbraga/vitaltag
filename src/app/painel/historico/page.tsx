import type { Metadata } from "next";
import Link from "next/link";
import { formatarDataExtenso, formatarHora } from "@/application/formatacao";
import { ACESSOS_POR_PAGINA } from "@/domain/regras/politicas";
import { exigirUsuario } from "@/app/_lib/sessao";
import { Aviso } from "@/components/aviso";
import { CLASSE_LINK_CONTORNO } from "@/components/estilos";
import { cn } from "@/lib/utils";
import { casosDeUso } from "@/infrastructure/container";
import { CabecalhoPagina } from "../_componentes/cabecalho-pagina";

export const metadata: Metadata = { title: "Histórico de acessos · VitalTag" };

export default async function PaginaHistorico({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const usuario = await exigirUsuario();
  const { pagina: paginaInformada } = await searchParams;
  const { itens, pagina, totalPaginas, total } = await casosDeUso().listarHistoricoAcessos.executar(
    usuario.id,
    { pagina: paginaInformada },
  );
  const primeiro = (pagina - 1) * ACESSOS_POR_PAGINA + 1;
  const ultimo = primeiro + itens.length - 1;

  return (
    <>
      <CabecalhoPagina
        titulo="Histórico de acessos"
        descricao="Registros das tentativas de abertura da sua ficha pública. Ficam disponíveis por 90 dias."
      />

      {total === 0 ? (
        <Aviso>Nenhuma tentativa de acesso registrada até agora.</Aviso>
      ) : itens.length === 0 ? (
        <Aviso>
          Esta página não tem registros.{" "}
          <Link href="/painel/historico" className="font-medium text-primary underline">
            Voltar à primeira página
          </Link>
        </Aviso>
      ) : (
        <>
          <ol
            aria-label="Tentativas de acesso, da mais recente para a mais antiga"
            className="rounded-2xl border bg-card px-[18px]"
          >
            {itens.map((item) => (
              <li
                key={item.id}
                data-acesso={item.sucesso ? "sucesso" : "falha"}
                className="flex items-center justify-between gap-3 border-b py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium">
                    <time dateTime={item.ocorridoEm.toISOString()}>{formatarDataExtenso(item.ocorridoEm)}</time>
                  </p>
                  <p className="text-[13px] text-muted-foreground">{formatarHora(item.ocorridoEm)}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                    item.sucesso ? "bg-emerald-50 text-emerald-700" : "bg-emergencia-suave text-emergencia",
                  )}
                >
                  {item.sucesso ? "Sucesso" : "Senha incorreta"}
                </span>
              </li>
            ))}
          </ol>
          <p data-resumo className="text-center text-[13px] text-muted-foreground">
            Mostrando {primeiro}–{ultimo} de {total} {total === 1 ? "registro" : "registros"}
          </p>
        </>
      )}

      {totalPaginas > 1 && (
        <nav aria-label="Paginação do histórico" className="flex gap-3">
          {pagina > 1 && (
            <Link href={`/painel/historico?pagina=${pagina - 1}`} className={CLASSE_LINK_CONTORNO}>
              Anterior
            </Link>
          )}
          {pagina < totalPaginas && (
            <Link href={`/painel/historico?pagina=${pagina + 1}`} className={CLASSE_LINK_CONTORNO}>
              Próxima
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
