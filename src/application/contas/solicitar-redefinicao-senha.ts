import { VALIDADE_LINK_REDEFINICAO_MS } from "@/domain/regras/politicas";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { Relogio } from "@/domain/servicos/relogio";
import type { ServicoEmail } from "@/domain/servicos/servico-email";
import type {
  ServicoImpressaoSenha,
  ServicoTokenRedefinicao,
} from "@/domain/servicos/servico-token-redefinicao";
import { montarUrl } from "@/application/links";
import { type SolicitarRedefinicaoEntrada, solicitarRedefinicaoSchema } from "./esquemas";

// Termina sempre do mesmo jeito, exista ou não a conta, para não revelar
// quais e-mails estão cadastrados.
export class SolicitarRedefinicaoSenha {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly tokens: ServicoTokenRedefinicao,
    private readonly impressao: ServicoImpressaoSenha,
    private readonly email: ServicoEmail,
    private readonly relogio: Relogio,
    private readonly urlBase: string,
  ) {}

  async executar(entrada: SolicitarRedefinicaoEntrada): Promise<void> {
    const { email } = solicitarRedefinicaoSchema.parse(entrada);
    const usuario = await this.usuarios.buscarPorEmail(email);
    if (!usuario) return;

    const token = this.tokens.emitir({
      usuarioId: usuario.id,
      expiraEm: new Date(this.relogio.agora().getTime() + VALIDADE_LINK_REDEFINICAO_MS),
      impressaoSenha: this.impressao.calcular(usuario.senhaHash),
    });
    const link = montarUrl(this.urlBase, `/redefinir-senha?token=${encodeURIComponent(token)}`);

    try {
      await this.email.enviar({
        para: usuario.email,
        assunto: "Redefinição de senha do VitalTag",
        texto: [
          `Olá, ${usuario.nome}.`,
          "",
          "Recebemos um pedido para redefinir a senha da sua conta no VitalTag.",
          `Use o link abaixo em até 30 minutos. Ele só pode ser usado uma vez:`,
          link,
          "",
          "Se você não fez esse pedido, ignore esta mensagem. Sua senha continua a mesma.",
        ].join("\n"),
      });
    } catch (erro) {
      // Uma falha de envio não pode mudar a resposta exibida ao visitante.
      console.error("Falha ao enviar o e-mail de redefinição de senha", erro);
    }
  }
}
