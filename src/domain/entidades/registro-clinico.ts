import type { TipoRegistro } from "@/domain/tipos";

// Alergias, medicamentos, doenças e cirurgias compartilham a mesma estrutura.
export interface RegistroClinico {
  id: string;
  fichaId: string;
  tipo: TipoRegistro;
  descricao: string;
  observacao: string | null;
  criadoEm: Date;
}

export interface NovoRegistroClinico {
  tipo: TipoRegistro;
  descricao: string;
  observacao: string | null;
}
