export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  emailVerificado: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type NovoUsuario = Pick<Usuario, "nome" | "email" | "senhaHash">;
