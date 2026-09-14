import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import type { ServicoImpressaoSenha } from "@/domain/servicos/servico-token-redefinicao";
import { type LoginEntrada, loginSchema } from "./esquemas";
import { paraUsuarioPublico, type UsuarioPublico } from "./usuario-publico";

export interface UsuarioAutenticado extends UsuarioPublico {
  impressaoSenha: string;
}

// Qualquer falha devolve null, para que a tela mostre a mesma mensagem genérica
// sem revelar se o e-mail está cadastrado.
export class AutenticarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly hash: ServicoHash,
    private readonly impressao: ServicoImpressaoSenha,
  ) {}

  async executar(entrada: LoginEntrada): Promise<UsuarioAutenticado | null> {
    const resultado = loginSchema.safeParse(entrada);
    if (!resultado.success) return null;

    const { email, senha } = resultado.data;
    const usuario = await this.usuarios.buscarPorEmail(email);

    if (!usuario) {
      // Calculo um hash descartável para que o tempo de resposta não denuncie
      // a inexistência da conta.
      await this.hash.gerar(senha);
      return null;
    }

    if (!(await this.hash.verificar(usuario.senhaHash, senha))) return null;

    return {
      ...paraUsuarioPublico(usuario),
      impressaoSenha: this.impressao.calcular(usuario.senhaHash),
    };
  }
}
