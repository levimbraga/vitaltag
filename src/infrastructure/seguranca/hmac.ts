import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  DadosTokenRedefinicao,
  ServicoImpressaoSenha,
  ServicoTokenRedefinicao,
} from "@/domain/servicos/servico-token-redefinicao";

// Cada uso do segredo leva um prefixo próprio, para que uma assinatura de um
// contexto nunca seja aceita em outro.
function assinar(segredo: string, contexto: string, conteudo: string): string {
  return createHmac("sha256", segredo).update(`${contexto}:${conteudo}`).digest("base64url");
}

function iguais(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export class HmacImpressaoSenha implements ServicoImpressaoSenha {
  constructor(private readonly segredo: string) {}

  calcular(senhaHash: string): string {
    return assinar(this.segredo, "impressao-senha", senhaHash).slice(0, 22);
  }
}

// Formato: <conteúdo em base64url>.<assinatura HMAC-SHA256>
export class HmacTokenRedefinicao implements ServicoTokenRedefinicao {
  constructor(private readonly segredo: string) {}

  emitir(dados: DadosTokenRedefinicao): string {
    const conteudo = Buffer.from(
      JSON.stringify({ u: dados.usuarioId, e: dados.expiraEm.getTime(), i: dados.impressaoSenha }),
    ).toString("base64url");
    return `${conteudo}.${assinar(this.segredo, "redefinicao-senha", conteudo)}`;
  }

  ler(token: string): DadosTokenRedefinicao | null {
    const partes = token.split(".");
    if (partes.length !== 2) return null;

    const [conteudo, assinatura] = partes;
    if (!iguais(assinatura, assinar(this.segredo, "redefinicao-senha", conteudo))) return null;

    try {
      const dados = JSON.parse(Buffer.from(conteudo, "base64url").toString("utf8"));
      if (typeof dados.u !== "string" || typeof dados.e !== "number" || typeof dados.i !== "string") {
        return null;
      }
      return { usuarioId: dados.u, expiraEm: new Date(dados.e), impressaoSenha: dados.i };
    } catch {
      return null;
    }
  }
}
