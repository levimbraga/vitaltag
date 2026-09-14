import { ErroTokenInvalido } from "@/domain/erros";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { Relogio } from "@/domain/servicos/relogio";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import type {
  ServicoImpressaoSenha,
  ServicoTokenRedefinicao,
} from "@/domain/servicos/servico-token-redefinicao";
import { type RedefinirSenhaEntrada, redefinirSenhaSchema } from "./esquemas";

export class RedefinirSenha {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly tokens: ServicoTokenRedefinicao,
    private readonly impressao: ServicoImpressaoSenha,
    private readonly hash: ServicoHash,
    private readonly relogio: Relogio,
  ) {}

  async executar(entrada: RedefinirSenhaEntrada): Promise<void> {
    const { token, senha } = redefinirSenhaSchema.parse(entrada);

    const dados = this.tokens.ler(token);
    if (!dados || dados.expiraEm.getTime() <= this.relogio.agora().getTime()) {
      throw new ErroTokenInvalido();
    }

    // Se a senha já foi trocada, a impressão não confere mais: é o que torna
    // o link de uso único.
    const usuario = await this.usuarios.buscarPorId(dados.usuarioId);
    if (!usuario || this.impressao.calcular(usuario.senhaHash) !== dados.impressaoSenha) {
      throw new ErroTokenInvalido();
    }

    await this.usuarios.atualizarSenha(usuario.id, await this.hash.gerar(senha));
  }
}
