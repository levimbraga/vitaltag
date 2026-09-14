import type { DadosCartaoImpressao, GeradorCartaoPdf } from "@/domain/servicos/gerador-cartao-pdf";

export class ReactPdfGeradorCartao implements GeradorCartaoPdf {
  async gerar(dados: DadosCartaoImpressao): Promise<Uint8Array> {
    // Carrego o gerador de PDF só quando um cartão é pedido, para não pesar nas
    // demais rotas do servidor.
    const { renderizarCartao } = await import("./cartao-pdf");
    return renderizarCartao(dados);
  }
}
