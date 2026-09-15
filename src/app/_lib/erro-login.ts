// O Auth.js lança CredentialsSignin quando o e-mail e a senha não conferem, e
// embrulha em CallbackRouteError qualquer exceção ocorrida durante a verificação,
// como o banco fora do ar. Os dois herdam de AuthError; só o primeiro é credencial inválida.
export function credencialNaoConfere(erro: unknown): boolean {
  return erro instanceof Error && "type" in erro && erro.type === "CredentialsSignin";
}
