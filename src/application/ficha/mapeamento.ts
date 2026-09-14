import type { DadosFichaClinica } from "@/domain/entidades/ficha-clinica";
import type { NovoRegistroClinico } from "@/domain/entidades/registro-clinico";
import type { TipoRegistro } from "@/domain/tipos";
import type { DadosFichaValidados } from "./esquemas";

// O formulário separa as quatro listas; na base elas vivem em registro_clinico,
// distinguidas pela coluna tipo.
export function paraDadosFicha(dados: DadosFichaValidados): DadosFichaClinica {
  const listas: [TipoRegistro, DadosFichaValidados["alergias"]][] = [
    ["ALERGIA", dados.alergias],
    ["MEDICAMENTO", dados.medicamentos],
    ["DOENCA", dados.doencas],
    ["CIRURGIA", dados.cirurgias],
  ];

  const registrosClinicos: NovoRegistroClinico[] = listas.flatMap(([tipo, itens]) =>
    itens.map((item) => ({
      tipo,
      descricao: item.descricao,
      observacao: item.observacao || null,
    })),
  );

  return {
    nome: dados.nome,
    sobrenome: dados.sobrenome,
    sexo: dados.sexo,
    tipoSanguineo: dados.tipoSanguineo,
    contatosEmergencia: dados.contatosEmergencia,
    registrosClinicos,
  };
}
