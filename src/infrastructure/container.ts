import { AcessarFichaPublica } from "@/application/acesso/acessar-ficha-publica";
import { ConsultarSituacaoFichaPublica } from "@/application/acesso/consultar-situacao-ficha-publica";
import { ListarHistoricoAcessos } from "@/application/acesso/listar-historico-acessos";
import { AutenticarUsuario } from "@/application/contas/autenticar-usuario";
import { CadastrarUsuario } from "@/application/contas/cadastrar-usuario";
import { RedefinirSenha } from "@/application/contas/redefinir-senha";
import { SolicitarRedefinicaoSenha } from "@/application/contas/solicitar-redefinicao-senha";
import { ValidarSessao } from "@/application/contas/validar-sessao";
import { AtualizarFichaClinica } from "@/application/ficha/atualizar-ficha-clinica";
import { CadastrarFichaClinica } from "@/application/ficha/cadastrar-ficha-clinica";
import { DefinirSenhaPublica } from "@/application/ficha/definir-senha-publica";
import { ExcluirFichaClinica } from "@/application/ficha/excluir-ficha-clinica";
import { ObterDadosCartao } from "@/application/ficha/obter-dados-cartao";
import { ObterFichaDoTitular } from "@/application/ficha/obter-ficha-do-titular";
import { ambiente } from "./config/ambiente";
import { criarServicoEmail } from "./email/criar-servico-email";
import { prisma } from "./prisma/cliente";
import { PrismaAcessoPublicoRepositorio } from "./prisma/repositorios/prisma-acesso-publico-repositorio";
import { PrismaFichaClinicaRepositorio } from "./prisma/repositorios/prisma-ficha-clinica-repositorio";
import { PrismaUsuarioRepositorio } from "./prisma/repositorios/prisma-usuario-repositorio";
import { RelogioDoSistema } from "./relogio-do-sistema";
import { Argon2ServicoHash } from "./seguranca/argon2-servico-hash";
import { HmacImpressaoSenha, HmacTokenRedefinicao } from "./seguranca/hmac";

// Ponto único onde as implementações concretas encontram as interfaces do domínio.
function montar() {
  const env = ambiente();

  const usuarios = new PrismaUsuarioRepositorio(prisma);
  const fichas = new PrismaFichaClinicaRepositorio(prisma);
  const acessos = new PrismaAcessoPublicoRepositorio(prisma);
  const hash = new Argon2ServicoHash();
  const impressao = new HmacImpressaoSenha(env.AUTH_SECRET);
  const tokens = new HmacTokenRedefinicao(env.AUTH_SECRET);
  const email = criarServicoEmail(env);
  const relogio = new RelogioDoSistema();

  return {
    urlBase: env.APP_URL,

    cadastrarUsuario: new CadastrarUsuario(usuarios, hash),
    autenticarUsuario: new AutenticarUsuario(usuarios, hash, impressao),
    validarSessao: new ValidarSessao(usuarios, impressao),
    solicitarRedefinicaoSenha: new SolicitarRedefinicaoSenha(
      usuarios,
      tokens,
      impressao,
      email,
      relogio,
      env.APP_URL,
    ),
    redefinirSenha: new RedefinirSenha(usuarios, tokens, impressao, hash, relogio),

    cadastrarFichaClinica: new CadastrarFichaClinica(fichas, usuarios, hash),
    atualizarFichaClinica: new AtualizarFichaClinica(fichas),
    obterFichaDoTitular: new ObterFichaDoTitular(fichas, env.APP_URL),
    excluirFichaClinica: new ExcluirFichaClinica(fichas),
    definirSenhaPublica: new DefinirSenhaPublica(fichas, usuarios, hash),
    obterDadosCartao: new ObterDadosCartao(fichas, hash, env.APP_URL),

    consultarSituacaoFichaPublica: new ConsultarSituacaoFichaPublica(fichas, acessos, relogio),
    acessarFichaPublica: new AcessarFichaPublica(fichas, acessos, hash, email, relogio),
    listarHistoricoAcessos: new ListarHistoricoAcessos(fichas, acessos),
  };
}

let instancia: ReturnType<typeof montar> | undefined;

export function casosDeUso() {
  instancia ??= montar();
  return instancia;
}
