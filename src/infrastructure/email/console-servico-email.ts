import type { MensagemEmail, ServicoEmail } from "@/domain/servicos/servico-email";

// Usado em desenvolvimento e na demonstração: em vez de enviar, mostra a
// mensagem no terminal do servidor, com o link pronto para copiar.
export class ConsoleServicoEmail implements ServicoEmail {
  async enviar(mensagem: MensagemEmail): Promise<void> {
    console.info(
      [
        "",
        "──────── E-mail (modo console) ────────",
        `Para: ${mensagem.para}`,
        `Assunto: ${mensagem.assunto}`,
        "",
        mensagem.texto,
        "───────────────────────────────────────",
        "",
      ].join("\n"),
    );
  }
}
