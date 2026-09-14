import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { nomeCompleto } from "@/domain/entidades/ficha-clinica";
import { exigirUsuario } from "@/app/_lib/sessao";
import { Aviso } from "@/components/aviso";
import { casosDeUso } from "@/infrastructure/container";
import { CabecalhoPagina } from "../_componentes/cabecalho-pagina";
import { FormularioCartao } from "./formulario-cartao";

export const metadata: Metadata = { title: "Cartão para impressão · VitalTag" };

export default async function PaginaCartao() {
  const usuario = await exigirUsuario();
  const { obterFichaDoTitular, gerarQrCodeDaFicha } = casosDeUso();
  const [ficha, qrCode] = await Promise.all([
    obterFichaDoTitular.executar(usuario.id),
    gerarQrCodeDaFicha.svg(usuario.id),
  ]);
  if (!ficha || !qrCode) redirect("/painel/ficha/nova");

  return (
    <>
      <CabecalhoPagina
        titulo="Cartão para o crachá"
        descricao="Imprima, recorte e cole no verso do seu crachá."
      />

      {/* Pré-visualização na proporção do crachá (85,6 x 54 mm); o PDF segue o mesmo desenho. */}
      <figure aria-label="Pré-visualização do cartão" className="aspect-[85.6/54] w-full max-w-full rounded-xl border bg-white p-[3.5%] shadow-sm">
        <div className="flex h-full flex-col">
          <div className="border-b pb-[2%]">
            <p className="text-[10px] font-bold tracking-[0.08em] text-emergencia">EMERGÊNCIA MÉDICA</p>
            <p className="truncate text-base leading-tight font-bold">{nomeCompleto(ficha)}</p>
          </div>
          <div className="flex min-h-0 flex-1 items-center gap-[4%]">
            <div
              aria-hidden
              className="aspect-square h-[88%] shrink-0 [&>svg]:size-full"
              dangerouslySetInnerHTML={{ __html: qrCode.svg }}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-[10px] leading-snug text-muted-foreground">
                Aponte a câmera do celular para o código e informe a senha:
              </p>
              <div className="rounded-md border-[1.5px] border-primary bg-secondary py-1 text-center">
                <p className="text-[8px] font-bold tracking-[0.06em] text-primary">SENHA DE ACESSO</p>
                <p className="font-mono text-lg leading-none font-bold tracking-[0.2em] text-primary">••••</p>
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] font-bold text-emergencia">
            Uso exclusivo em situações de emergência médica.
          </p>
        </div>
      </figure>

      <Aviso>
        Guarde a senha em local seguro. Quem tiver o cartão completo consegue ver sua ficha clínica.
      </Aviso>

      <FormularioCartao />
    </>
  );
}
