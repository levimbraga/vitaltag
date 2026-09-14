import { type FichaClinica, registrosDoTipo } from "@/domain/entidades/ficha-clinica";
import type { Sexo, TipoRegistro, TipoSanguineo } from "@/domain/tipos";

export interface ItemFichaPublica {
  descricao: string;
  observacao: string | null;
}

export interface ContatoFichaPublica {
  nome: string;
  telefone: string;
  parentesco: string;
}

// Apenas o que o socorrista precisa ver: sem identificadores internos nem hashes.
export interface FichaPublica {
  nome: string;
  sobrenome: string;
  sexo: Sexo;
  tipoSanguineo: TipoSanguineo;
  alergias: ItemFichaPublica[];
  medicamentos: ItemFichaPublica[];
  doencas: ItemFichaPublica[];
  cirurgias: ItemFichaPublica[];
  contatosEmergencia: ContatoFichaPublica[];
  atualizadaEm: Date;
}

export function paraFichaPublica(ficha: FichaClinica): FichaPublica {
  const itens = (tipo: TipoRegistro) =>
    registrosDoTipo(ficha, tipo).map(({ descricao, observacao }) => ({ descricao, observacao }));

  return {
    nome: ficha.nome,
    sobrenome: ficha.sobrenome,
    sexo: ficha.sexo,
    tipoSanguineo: ficha.tipoSanguineo,
    alergias: itens("ALERGIA"),
    medicamentos: itens("MEDICAMENTO"),
    doencas: itens("DOENCA"),
    cirurgias: itens("CIRURGIA"),
    contatosEmergencia: ficha.contatosEmergencia.map(({ nome, telefone, parentesco }) => ({
      nome,
      telefone,
      parentesco,
    })),
    atualizadaEm: ficha.atualizadaEm,
  };
}
