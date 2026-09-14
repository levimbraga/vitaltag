export interface GeradorQrCode {
  svg(conteudo: string): Promise<string>;
  png(conteudo: string, tamanhoPx: number): Promise<Uint8Array>;
}
