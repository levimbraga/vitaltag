import * as QRCode from "qrcode";
import type { GeradorQrCode } from "@/domain/servicos/gerador-qr-code";

// Correção de erro nível M e margem de 2 módulos: leitura confiável por câmeras
// comuns mesmo com o cartão impresso e plastificado.
const OPCOES = {
  errorCorrectionLevel: "M",
  margin: 2,
  color: { dark: "#1A1A2E", light: "#FFFFFF" },
} as const;

export class QrCodeGerador implements GeradorQrCode {
  svg(conteudo: string): Promise<string> {
    return QRCode.toString(conteudo, { ...OPCOES, type: "svg" });
  }

  async png(conteudo: string, tamanhoPx: number): Promise<Uint8Array> {
    const buffer = await QRCode.toBuffer(conteudo, { ...OPCOES, type: "png", width: tamanhoPx });
    return new Uint8Array(buffer);
  }
}
