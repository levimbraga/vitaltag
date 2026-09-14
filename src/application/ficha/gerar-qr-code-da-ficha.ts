import { TAMANHO_MINIMO_QR_PNG } from "@/domain/regras/politicas";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { GeradorQrCode } from "@/domain/servicos/gerador-qr-code";
import { urlPublicaDaFicha } from "@/application/links";

export interface QrCodeSvg {
  urlPublica: string;
  svg: string;
}

export interface QrCodePng {
  urlPublica: string;
  png: Uint8Array;
}

// O conteúdo codificado é somente a URL pública da ficha: a senha nunca entra no QR Code.
export class GerarQrCodeDaFicha {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly gerador: GeradorQrCode,
    private readonly urlBase: string,
  ) {}

  async svg(usuarioId: string): Promise<QrCodeSvg | null> {
    const urlPublica = await this.urlDaFicha(usuarioId);
    if (!urlPublica) return null;
    return { urlPublica, svg: await this.gerador.svg(urlPublica) };
  }

  async png(usuarioId: string, tamanhoPx = TAMANHO_MINIMO_QR_PNG): Promise<QrCodePng | null> {
    const urlPublica = await this.urlDaFicha(usuarioId);
    if (!urlPublica) return null;
    const tamanho = Math.max(tamanhoPx, TAMANHO_MINIMO_QR_PNG);
    return { urlPublica, png: await this.gerador.png(urlPublica, tamanho) };
  }

  private async urlDaFicha(usuarioId: string): Promise<string | null> {
    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    return ficha?.ativa ? urlPublicaDaFicha(this.urlBase, ficha.slugPublico) : null;
  }
}
