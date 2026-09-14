export interface DadosCartaoImpressao {
  nomeTitular: string;
  senhaPublica: string;
  urlPublica: string;
  qrCodePng: Uint8Array;
}

export interface GeradorCartaoPdf {
  gerar(dados: DadosCartaoImpressao): Promise<Uint8Array>;
}
