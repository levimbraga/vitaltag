export interface MensagemEmail {
  para: string;
  assunto: string;
  texto: string;
  html?: string;
}

export interface ServicoEmail {
  enviar(mensagem: MensagemEmail): Promise<void>;
}
