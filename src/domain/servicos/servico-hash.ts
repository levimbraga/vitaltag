export interface ServicoHash {
  gerar(valor: string): Promise<string>;
  verificar(hash: string, valor: string): Promise<boolean>;
}
