export interface DadosTokenRedefinicao {
  usuarioId: string;
  expiraEm: Date;
  impressaoSenha: string;
}

export interface ServicoTokenRedefinicao {
  emitir(dados: DadosTokenRedefinicao): string;
  /** Devolve null quando o token está malformado ou a assinatura não confere. */
  ler(token: string): DadosTokenRedefinicao | null;
}

/**
 * Deriva uma impressão curta do hash da senha. Ela vai no token de redefinição e
 * na sessão: quando a senha muda, a impressão muda, invalidando os dois.
 */
export interface ServicoImpressaoSenha {
  calcular(senhaHash: string): string;
}
