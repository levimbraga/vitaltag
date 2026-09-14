// Dados de demonstração. Todos os nomes, e-mails e telefones são fictícios: os
// e-mails usam o domínio reservado .test, os telefones usam DDD 00 e os IPs do
// histórico pertencem à faixa reservada para documentação (198.51.100.0/24).
import { PrismaClient, type tipo_registro } from "@prisma/client";
import { Argon2ServicoHash } from "../src/infrastructure/seguranca/argon2-servico-hash";

const prisma = new PrismaClient();
const hash = new Argon2ServicoHash();

const DEMONSTRACAO = {
  nome: "Marina Duarte Lima",
  email: "demo@vitaltag.test",
  senha: "Demo1234",
  senhaPublica: "4729",
};

// Conta usada para mostrar o cadastro na gravação; o seed a remove para que o
// mesmo e-mail possa ser usado a cada tomada.
const EMAIL_GRAVACAO = "gravacao@vitaltag.test";

const DIA_MS = 24 * 60 * 60 * 1000;
const MINUTO_MS = 60 * 1000;

function registros(tipo: tipo_registro, descricoes: string[]) {
  return descricoes.map((descricao) => ({ tipo, descricao }));
}

async function main() {
  // Recomeço do zero a cada execução: a demonstração sempre parte do mesmo estado.
  await prisma.usuario.deleteMany({ where: { email: { in: [DEMONSTRACAO.email, EMAIL_GRAVACAO] } } });

  const usuario = await prisma.usuario.create({
    data: {
      nome: DEMONSTRACAO.nome,
      email: DEMONSTRACAO.email,
      senhaHash: await hash.gerar(DEMONSTRACAO.senha),
      emailVerificado: true,
    },
  });

  const ficha = await prisma.fichaClinica.create({
    data: {
      usuarioId: usuario.id,
      nome: "Marina",
      sobrenome: "Duarte Lima",
      sexo: "FEMININO",
      tipoSanguineo: "O_NEG",
      senhaPublicaHash: await hash.gerar(DEMONSTRACAO.senhaPublica),
      contatosEmergencia: {
        create: [
          { nome: "Rafael Duarte", telefone: "(00) 99999-0001", parentesco: "Irmão", prioridade: 1 },
          { nome: "Helena Lima", telefone: "(00) 99999-0002", parentesco: "Mãe", prioridade: 2 },
        ],
      },
      registrosClinicos: {
        create: [
          ...registros("ALERGIA", ["Dipirona", "Frutos do mar", "Penicilina"]),
          ...registros("MEDICAMENTO", ["Levotiroxina 50 mcg — 1x ao dia", "Losartana 50 mg — 1x ao dia"]),
          ...registros("DOENCA", ["Hipertensão arterial", "Hipotireoidismo"]),
          ...registros("CIRURGIA", ["Apendicectomia (2019)"]),
        ],
      },
    },
  });

  // 24 consultas antigas, espalhadas pelos últimos 60 dias, para o histórico já
  // começar com duas páginas. Nenhuma sequência chega a 5 falhas seguidas.
  const agora = Date.now();
  await prisma.acessoPublico.createMany({
    data: Array.from({ length: 24 }, (_, indice) => ({
      fichaId: ficha.id,
      ipOrigem: `198.51.100.${10 + indice}`,
      userAgent: "Navegador de demonstração",
      sucesso: indice % 4 !== 1,
      ocorridoEm: new Date(agora - (indice + 1) * 2.5 * DIA_MS - ((indice * 37) % 600) * MINUTO_MS),
    })),
  });

  console.info(
    [
      "Dados de demonstração criados.",
      `  E-mail: ${DEMONSTRACAO.email}`,
      `  Senha da conta: ${DEMONSTRACAO.senha}`,
      `  Senha de acesso público: ${DEMONSTRACAO.senhaPublica}`,
      `  Caminho da ficha pública: /f/${ficha.slugPublico}`,
    ].join("\n"),
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
