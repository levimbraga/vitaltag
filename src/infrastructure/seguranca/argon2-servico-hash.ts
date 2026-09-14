import { hash, type Options, verify } from "@node-rs/argon2";
import type { ServicoHash } from "@/domain/servicos/servico-hash";

// Argon2id (valor 2 no enum da biblioteca) com os parâmetros mínimos recomendados
// pela OWASP: 19 MiB de memória, 2 iterações e paralelismo 1.
const OPCOES: Options = {
  algorithm: 2 as NonNullable<Options["algorithm"]>,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export class Argon2ServicoHash implements ServicoHash {
  gerar(valor: string): Promise<string> {
    return hash(valor, OPCOES);
  }

  async verificar(hashArmazenado: string, valor: string): Promise<boolean> {
    try {
      return await verify(hashArmazenado, valor);
    } catch {
      // Hash malformado equivale a senha incorreta.
      return false;
    }
  }
}
