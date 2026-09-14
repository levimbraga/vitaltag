export interface ContatoEmergencia {
  id: string;
  fichaId: string;
  nome: string;
  telefone: string;
  parentesco: string;
  prioridade: number;
}

export type NovoContatoEmergencia = Pick<ContatoEmergencia, "nome" | "telefone" | "parentesco">;
