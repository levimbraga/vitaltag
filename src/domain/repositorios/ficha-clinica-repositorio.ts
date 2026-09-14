import type {
  DadosFichaClinica,
  FichaClinica,
  FichaClinicaComTitular,
} from "@/domain/entidades/ficha-clinica";

export interface FichaClinicaRepositorio {
  buscarPorUsuario(usuarioId: string): Promise<FichaClinica | null>;
  buscarPorSlug(slugPublico: string): Promise<FichaClinicaComTitular | null>;
  /** Lança ErroFichaJaExiste quando o usuário já possui ficha. */
  criar(usuarioId: string, dados: DadosFichaClinica, senhaPublicaHash: string): Promise<FichaClinica>;
  /** Substitui contatos e registros; o slug público é preservado. */
  atualizar(fichaId: string, dados: DadosFichaClinica): Promise<FichaClinica>;
  atualizarSenhaPublica(fichaId: string, senhaPublicaHash: string): Promise<void>;
  /** Remove a ficha e, em cascata, contatos, registros e histórico de acessos. */
  excluir(fichaId: string): Promise<void>;
}
