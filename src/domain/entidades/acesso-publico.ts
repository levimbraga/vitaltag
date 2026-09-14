export interface AcessoPublico {
  id: string;
  fichaId: string;
  ipOrigem: string;
  userAgent: string | null;
  sucesso: boolean;
  ocorridoEm: Date;
}

export type NovoAcessoPublico = Omit<AcessoPublico, "id">;

export type TentativaAcesso = Pick<AcessoPublico, "sucesso" | "ocorridoEm">;
