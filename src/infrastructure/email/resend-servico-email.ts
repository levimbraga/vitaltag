import type { MensagemEmail, ServicoEmail } from "@/domain/servicos/servico-email";

export class ResendServicoEmail implements ServicoEmail {
  constructor(
    private readonly chaveApi: string,
    private readonly remetente: string,
  ) {}

  async enviar(mensagem: MensagemEmail): Promise<void> {
    const resposta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.chaveApi}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.remetente,
        to: [mensagem.para],
        subject: mensagem.assunto,
        text: mensagem.texto,
        html: mensagem.html,
      }),
    });

    if (!resposta.ok) {
      throw new Error(`O Resend recusou o envio (HTTP ${resposta.status}): ${await resposta.text()}`);
    }
  }
}
