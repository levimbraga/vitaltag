import { ErroEmailJaCadastrado } from "@/domain/erros";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import { type CadastroUsuarioEntrada, cadastroUsuarioSchema } from "./esquemas";
import { paraUsuarioPublico, type UsuarioPublico } from "./usuario-publico";

export class CadastrarUsuario {
  constructor(
    private readonly usuarios: UsuarioRepositorio,
    private readonly hash: ServicoHash,
  ) {}

  async executar(entrada: CadastroUsuarioEntrada): Promise<UsuarioPublico> {
    const dados = cadastroUsuarioSchema.parse(entrada);

    if (await this.usuarios.buscarPorEmail(dados.email)) {
      throw new ErroEmailJaCadastrado();
    }

    const usuario = await this.usuarios.criar({
      nome: dados.nome,
      email: dados.email,
      senhaHash: await this.hash.gerar(dados.senha),
    });

    return paraUsuarioPublico(usuario);
  }
}
