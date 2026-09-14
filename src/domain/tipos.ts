export const SEXOS = ["FEMININO", "MASCULINO", "OUTRO", "NAO_INFORMADO"] as const;
export type Sexo = (typeof SEXOS)[number];

export const TIPOS_SANGUINEOS = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
] as const;
export type TipoSanguineo = (typeof TIPOS_SANGUINEOS)[number];

export const TIPOS_REGISTRO = ["ALERGIA", "MEDICAMENTO", "DOENCA", "CIRURGIA"] as const;
export type TipoRegistro = (typeof TIPOS_REGISTRO)[number];

export const ROTULO_SEXO: Record<Sexo, string> = {
  FEMININO: "Feminino",
  MASCULINO: "Masculino",
  OUTRO: "Outro",
  NAO_INFORMADO: "Prefiro não informar",
};

export const ROTULO_TIPO_SANGUINEO: Record<TipoSanguineo, string> = {
  A_POS: "A+",
  A_NEG: "A−",
  B_POS: "B+",
  B_NEG: "B−",
  AB_POS: "AB+",
  AB_NEG: "AB−",
  O_POS: "O+",
  O_NEG: "O−",
};

export const ROTULO_TIPO_REGISTRO: Record<TipoRegistro, string> = {
  ALERGIA: "Alergias",
  MEDICAMENTO: "Medicamentos em uso",
  DOENCA: "Doenças",
  CIRURGIA: "Cirurgias",
};
