import type { Metadata } from "next";
import Link from "next/link";
import { formatarAtualizacao } from "@/application/formatacao";
import { exigirUsuario } from "@/app/_lib/sessao";
import { Aviso } from "@/components/aviso";
import { CLASSE_LINK_CONTORNO, CLASSE_LINK_PRIMARIO } from "@/components/estilos";
import { casosDeUso } from "@/infrastructure/container";
import { CabecalhoPainel } from "./cabecalho-painel";
import { DialogoExcluirFicha } from "./dialogo-excluir-ficha";

export const metadata: Metadata = { title: "Painel · VitalTag" };

const AVISOS: Record<string, string> = {
  "ficha-atualizada": "Ficha atualizada. As alterações já aparecem na página pública.",
  "ficha-excluida":
    "Ficha excluída. O link público deixou de funcionar e você pode cadastrar uma nova ficha quando quiser.",
};

export default async function PaginaPainel({
  searchParams,
}: {
  searchParams: Promise<{ aviso?: string }>;
}) {
  const usuario = await exigirUsuario();
  const { aviso } = await searchParams;
  const { obterFichaDoTitular, gerarQrCodeDaFicha } = casosDeUso();
  const [ficha, qrCode] = await Promise.all([
    obterFichaDoTitular.executar(usuario.id),
    gerarQrCodeDaFicha.svg(usuario.id),
  ]);
  const textoAviso = aviso ? AVISOS[aviso] : undefined;

  return (
    <>
      <CabecalhoPainel nome={usuario.nome} />
      {textoAviso && <Aviso tom="sucesso">{textoAviso}</Aviso>}

      {ficha && qrCode ? (
        <>
          <section aria-labelledby="status-ficha" className="rounded-2xl border bg-card p-4">
            <h2 id="status-ficha" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="size-2.5 rounded-full bg-emerald-600" />
              Ficha ativa e publicada
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Última atualização em{" "}
              <time dateTime={ficha.atualizadaEm.toISOString()}>
                {formatarAtualizacao(ficha.atualizadaEm)}
              </time>
              .
            </p>
          </section>

          <section
            aria-label="QR Code da ficha"
            className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5"
          >
            <div
              role="img"
              aria-label="QR Code que abre a página pública da ficha"
              className="size-[150px] [&>svg]:size-full"
              dangerouslySetInnerHTML={{ __html: qrCode.svg }}
            />
            <a
              href={qrCode.urlPublica}
              target="_blank"
              rel="noopener noreferrer"
              data-link-publico
              className="max-w-full text-center text-[13px] break-all text-muted-foreground underline-offset-4 hover:underline"
            >
              {qrCode.urlPublica.replace(/^https?:\/\//, "")}
            </a>
            <Link
              href="/painel/qrcode"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Ampliar e baixar QR Code
            </Link>
          </section>

          <nav aria-label="Ações da ficha" className="flex flex-col gap-[18px]">
            <Link href="/painel/cartao" className={CLASSE_LINK_PRIMARIO}>
              Ver cartão para impressão
            </Link>
            <Link href="/painel/ficha/editar" className={CLASSE_LINK_CONTORNO}>
              Editar ficha clínica
            </Link>
            <Link href="/painel/historico" className={CLASSE_LINK_CONTORNO}>
              Histórico de acessos
            </Link>
            <Link href="/painel/senha-publica" className={CLASSE_LINK_CONTORNO}>
              Gerar nova senha de acesso
            </Link>
            <DialogoExcluirFicha />
          </nav>
        </>
      ) : (
        <>
          <section aria-labelledby="status-ficha" className="rounded-2xl border bg-card p-4">
            <h2 id="status-ficha" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="size-2.5 rounded-full bg-muted-foreground/50" />
              Ficha pendente de preenchimento
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Cadastre sua ficha clínica para gerar o QR Code de emergência.
            </p>
          </section>
          <Link href="/painel/ficha/nova" className={CLASSE_LINK_PRIMARIO}>
            Cadastrar ficha clínica
          </Link>
        </>
      )}
    </>
  );
}
