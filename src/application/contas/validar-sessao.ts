import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { ServicoImpressaoSenha } from "@/domain/servicos/servico-token-redefinicao";
import { paraUsuarioPublico, type UsuarioPublico } from "./usuario-publico";

export interface DadosSessao {
  usuarioId: string;
  impressaoSenha: string;
}

// A sessão só continua válida enquanto a senha for a mesma do momento do login.
export class ValidarSessao {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly impressao: ServicoImpressaoSenha,
  ) {}

  async executar(sessao: DadosSessao): Promise<UsuarioPublico | null> {
    const usuario = await this.usuarios.buscarPorId(sessao.usuarioId);
    if (!usuario) return null;
    if (this.impressao.calcular(usuario.senhaHash) !== sessao.impressaoSenha) return null;
    return paraUsuarioPublico(usuario);
  }
}
