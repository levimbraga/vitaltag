import type { GeradorCartaoPdf } from "@/domain/servicos/gerador-cartao-pdf";
import type { GeradorQrCode } from "@/domain/servicos/gerador-qr-code";
import type { DefinirSenhaPublicaEntrada } from "./esquemas";
import type { ObterDadosCartao } from "./obter-dados-cartao";

// Resolução folgada para o QR Code de cerca de 3 cm do cartão sair nítido em 300 dpi.
const TAMANHO_QR_CARTAO_PX = 600;

export class GerarCartaoPdf {
  constructor(
    private readonly obterDadosCartao: ObterDadosCartao,
    private readonly qrCode: GeradorQrCode,
    private readonly cartao: GeradorCartaoPdf,
  ) {}

  async executar(usuarioId: string, entrada: DefinirSenhaPublicaEntrada): Promise<Uint8Array> {
    // ObterDadosCartao confere a senha contra o hash antes de qualquer geração.
    const dados = await this.obterDadosCartao.executar(usuarioId, entrada);
    const qrCodePng = await this.qrCode.png(dados.urlPublica, TAMANHO_QR_CARTAO_PX);
    return this.cartao.gerar({ ...dados, qrCodePng });
  }
}
