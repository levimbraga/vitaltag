import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { exigirUsuario } from "@/app/_lib/sessao";
import { Aviso } from "@/components/aviso";
import { CLASSE_LINK_CONTORNO, CLASSE_LINK_PRIMARIO } from "@/components/estilos";
import { casosDeUso } from "@/infrastructure/container";
import { CabecalhoPagina } from "../_componentes/cabecalho-pagina";

export const metadata: Metadata = { title: "Seu QR Code · VitalTag" };

export default async function PaginaQrCode() {
  const usuario = await exigirUsuario();
  const qrCode = await casosDeUso().gerarQrCodeDaFicha.svg(usuario.id);
  if (!qrCode) redirect("/painel/ficha/nova");

  return (
    <>
      <CabecalhoPagina
        titulo="Seu QR Code"
        descricao="Aponte a câmera de qualquer celular para abrir a página da sua ficha."
      />

      <section className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-6">
        <div
          role="img"
          aria-label="QR Code que abre a página pública da ficha"
          className="size-[230px] max-w-full [&>svg]:size-full"
          dangerouslySetInnerHTML={{ __html: qrCode.svg }}
        />
        <p className="max-w-full text-center text-sm break-all text-muted-foreground">
          {qrCode.urlPublica.replace(/^https?:\/\//, "")}
        </p>
      </section>

      <Aviso>
        O QR Code não contém a sua senha. Ela é solicitada na página e deve ser impressa
        separadamente.
      </Aviso>

      {/* Rota de download: navegação comum do navegador, não do roteador. */}
      <a href="/painel/qrcode/png" download="qrcode-vitaltag.png" className={CLASSE_LINK_PRIMARIO}>
        Baixar em PNG
      </a>
      <Link href="/painel/cartao" className={CLASSE_LINK_CONTORNO}>
        Gerar cartão para impressão
      </Link>
    </>
  );
}
