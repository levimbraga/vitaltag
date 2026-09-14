import type { ContatoEmergencia, NovoContatoEmergencia } from "@/domain/entidades/contato-emergencia";
import type { NovoRegistroClinico, RegistroClinico } from "@/domain/entidades/registro-clinico";
import type { Sexo, TipoRegistro, TipoSanguineo } from "@/domain/tipos";

export interface FichaClinica {
  id: string;
  usuarioId: string;
  slugPublico: string;
  nome: string;
  sobrenome: string;
  sexo: Sexo;
  tipoSanguineo: TipoSanguineo;
  senhaPublicaHash: string;
  ativa: boolean;
  criadaEm: Date;
  atualizadaEm: Date;
  contatosEmergencia: ContatoEmergencia[];
  registrosClinicos: RegistroClinico[];
}

export interface Titular {
  nome: string;
  email: string;
}

export interface FichaClinicaComTitular extends FichaClinica {
  titular: Titular;
}

// Dados editáveis pelo titular. O slug público e a senha pública ficam de fora
// de propósito: o primeiro nunca muda e a segunda tem fluxo próprio.
export interface DadosFichaClinica {
  nome: string;
  sobrenome: string;
  sexo: Sexo;
  tipoSanguineo: TipoSanguineo;
  contatosEmergencia: NovoContatoEmergencia[];
  registrosClinicos: NovoRegistroClinico[];
}

export function nomeCompleto(ficha: Pick<FichaClinica, "nome" | "sobrenome">): string {
  return `${ficha.nome} ${ficha.sobrenome}`.trim();
}

export function registrosDoTipo(
  ficha: Pick<FichaClinica, "registrosClinicos">,
  tipo: TipoRegistro,
): RegistroClinico[] {
  return ficha.registrosClinicos.filter((registro) => registro.tipo === tipo);
}
