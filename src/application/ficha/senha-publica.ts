import { ErroSenhaPublicaIgualSenhaConta } from "@/domain/erros";
import type { ServicoHash } from "@/domain/servicos/servico-hash";

export async function garantirSenhaPublicaDistinta(
  hash: ServicoHash,
  senhaContaHash: string,
  senhaPublica: string,
): Promise<void> {
  if (await hash.verificar(senhaContaHash, senhaPublica)) {
    throw new ErroSenhaPublicaIgualSenhaConta();
  }
}
