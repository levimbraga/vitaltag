import type { Relogio } from "@/domain/servicos/relogio";

export class RelogioDoSistema implements Relogio {
  agora(): Date {
    return new Date();
  }
}
