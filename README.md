# VitalTag

O VitalTag é um sistema web para cadastro e consulta de informações clínicas de
emergência. A ideia central do projeto é permitir que qualquer pessoa registre os
dados de saúde que precisam ser conhecidos rapidamente em uma situação crítica —
tipo sanguíneo, alergias, doenças, medicamentos em uso e contatos
de emergência — e que esses dados possam ser acessados por meio de um QR Code.

O QR Code aponta para uma página pública de leitura, mas o conteúdo da ficha só é
exibido depois que a pessoa que fez a leitura informa a senha de acesso definida
pelo titular. Assim, o socorrista ou acompanhante consegue chegar à informação em
segundos, sem que a ficha fique exposta para quem simplesmente escanear a etiqueta.

Este é um projeto acadêmico que desenvolvo individualmente, com foco em aplicar
arquitetura em camadas, tipagem forte e validação de dados em uma aplicação real.

## Funcionalidades

- Cadastro de usuário com e-mail e senha
- Login e logout, com sessão expirando após 30 minutos de inatividade
- Recuperação de senha por link temporário de uso único enviado ao e-mail
- Cadastro da ficha clínica com nome, sobrenome, sexo, tipo sanguíneo
  e contatos de emergência
- Registro de alergias, medicamentos em uso, doenças e cirurgias
  realizadas
- Edição da ficha sem alterar o link público já impresso
- Exclusão definitiva da ficha, tornando o link público indisponível
- Definição de senha de acesso público, distinta da senha de conta
- Geração de QR Code apontando para a URL pública única da ficha, com
  download em PNG
- Cartão em PDF tamanho crachá, com o QR Code e a senha em campo
  separado
- Página pública de emergência liberada somente após a senha de acesso
- Bloqueio temporário do acesso público após 5 tentativas incorretas,
  com aviso por e-mail ao titular
- Histórico das consultas realizadas à ficha, com data, hora e
  resultado

## Tecnologias

| Camada / Recurso        | Tecnologia                  |
| ----------------------- | --------------------------- |
| Framework web           | Next.js 15 (App Router)     |
| Biblioteca de interface | React 19                    |
| Linguagem               | TypeScript                  |
| Estilização             | Tailwind CSS                |
| Componentes de UI       | shadcn/ui                   |
| ORM / acesso a dados    | Prisma ORM                  |
| Autenticação            | Auth.js                     |
| Validação de esquemas   | Zod                         |
| Hash de senhas          | Argon2id                    |
| QR Code e PDF           | qrcode e React-pdf          |
| Testes                  | Vitest                      |
| Banco de dados          | PostgreSQL 16 (Supabase)    |
| Hospedagem              | Vercel                      |

## Arquitetura

Organizei o código em quatro camadas, com dependências apontando sempre de fora
para dentro. O objetivo é manter as regras de negócio independentes do framework
e do banco de dados, de forma que uma troca de infraestrutura não obrigue a
reescrever o núcleo do sistema.

**Domínio (`src/domain`)**
Camada mais interna. Concentra as entidades do negócio — usuário, ficha clínica,
contato de emergência, registro clínico e acesso público —, os tipos e enums do
domínio, as regras intrínsecas, como o bloqueio por tentativas, e as interfaces de
repositório e de serviços. Não conhece Prisma, Next.js nem qualquer detalhe de entrega.

**Aplicação (`src/application`)**
Orquestra os casos de uso do sistema: cadastrar usuário, redefinir senha, criar e
editar a ficha, definir a senha de acesso, gerar o QR Code e o cartão, validar a
senha informada na página pública e listar o histórico. Cada caso de uso recebe as
dependências pelas interfaces declaradas no domínio, o que torna essa camada testável
sem banco de dados. Os esquemas Zod de entrada dos casos de uso também vivem aqui.

**Infraestrutura (`src/infrastructure`)**
Implementa as interfaces do domínio com tecnologia concreta: repositórios Prisma,
configuração do Auth.js, hash com Argon2id, geração de QR Code e de PDF, envio de
e-mail e o contêiner que liga cada caso de uso às suas implementações.

**Apresentação (`src/app`)**
Rotas do App Router do Next.js, Server Components, Server Actions, Route Handlers
e componentes de interface. Recebe a requisição, valida a entrada com Zod, chama
o caso de uso correspondente e devolve a resposta renderizada. Não contém regra
de negócio.

O fluxo típico de uma requisição é: `app` → `application` → `domain`, com a
`infrastructure` injetada na fronteira para satisfazer as interfaces do domínio.

Registrei em [`docs/decisoes-tecnicas.md`](docs/decisoes-tecnicas.md) as decisões que
tomei durante a implementação, e em
[`docs/verificacao-user-stories.md`](docs/verificacao-user-stories.md) como verifiquei
cada critério de aceite.

## Estrutura de pastas

```
vitaltag/
├── .github/
│   └── workflows/
│       └── ci.yml                  # lint e testes a cada push e pull request
├── docs/
│   ├── decisoes-tecnicas.md        # decisões de implementação e seus motivos
│   ├── issues.md                   # user stories
│   └── verificacao-user-stories.md # verificação dos critérios de aceite
├── prisma/
│   ├── migrations/                 # histórico de migrações do banco
│   ├── schema.prisma               # modelo de dados e enums
│   └── seed.ts                     # usuário e ficha fictícios para demonstração
├── src/
│   ├── app/                        # rotas, Server Actions e componentes de UI
│   ├── application/                # casos de uso e esquemas de validação
│   ├── components/                 # componentes de interface compartilhados
│   ├── domain/                     # entidades, regras e interfaces
│   ├── infrastructure/             # Prisma, Auth.js, Argon2, QR Code, PDF e e-mail
│   ├── lib/                        # utilitários do shadcn/ui
│   └── middleware.ts               # proteção e renovação da sessão
├── .env.example
├── LICENSE
├── README.md
└── vercel.json                     # região das funções na Vercel
```

## Como executar localmente

Requisitos: Node.js 22 ou superior e um banco PostgreSQL (uso o Supabase).

```bash
npm install                  # instala as dependências e gera o Prisma Client
cp .env.example .env         # preencha as variáveis descritas abaixo
npx prisma migrate deploy    # cria as tabelas no banco
npm run seed                 # opcional: cria a conta de demonstração
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

Com `EMAIL_PROVIDER="console"`, os e-mails de redefinição de senha e de aviso de
bloqueio não são enviados: aparecem no terminal onde o servidor está rodando, com o
link pronto para abrir.

### Variáveis de ambiente

| Variável         | Obrigatória | Descrição |
| ---------------- | ----------- | --------- |
| `DATABASE_URL`   | Sim         | Conexão com o PostgreSQL pelo pooler do Supabase (porta 6543, com `pgbouncer=true`). É a conexão usada pela aplicação. |
| `DIRECT_URL`     | Sim         | Conexão direta com o PostgreSQL (porta 5432), usada pelo Prisma nas migrações. |
| `AUTH_SECRET`    | Sim         | Segredo que assina a sessão e os links de redefinição de senha. Gere com `openssl rand -base64 33`. |
| `NEXTAUTH_URL`   | Sim         | Endereço base da aplicação, usado pelo Auth.js. |
| `APP_URL`        | Sim         | Endereço base usado no link público e no conteúdo do QR Code. |
| `EMAIL_PROVIDER` | Não         | `console` (padrão) ou `resend`. |
| `EMAIL_FROM`     | Não         | Remetente das mensagens enviadas pelo Resend. |
| `RESEND_API_KEY` | Não         | Chave de API do Resend. Sem ela, as mensagens são exibidas no console. |

### Conta de demonstração

O comando `npm run seed` cria uma conta com ficha completa e histórico de acessos,
toda com dados fictícios:

| Campo                   | Valor                |
| ----------------------- | -------------------- |
| E-mail                  | `demo@vitaltag.test` |
| Senha da conta          | `Demo1234`           |
| Senha de acesso público | `4729`               |

Rodar o comando de novo apaga essa conta e a recria do zero, o que permite repetir
a demonstração a partir do mesmo estado.

## Scripts

| Comando         | Descrição                                        |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Ambiente de desenvolvimento                      |
| `npm run build` | Build de produção                                |
| `npm start`     | Servidor com o build de produção                 |
| `npm run lint`  | Análise estática com ESLint                      |
| `npm test`      | Testes unitários com Vitest                      |
| `npm run seed`  | Cria ou recria a conta de demonstração           |

## Deploy na Vercel

1. Importar o repositório na Vercel; o framework Next.js é detectado automaticamente.
2. Cadastrar as variáveis de ambiente da tabela acima.
3. Fazer o primeiro deploy. O script `postinstall` gera o Prisma Client durante o build.
   As migrações não rodam no deploy: para um banco novo, execute
   `npx prisma migrate deploy` com o `.env` apontando para ele.
4. Com o domínio definido, ajustar `APP_URL` e `NEXTAUTH_URL` para esse endereço e
   fazer um novo deploy, já que o QR Code é gerado a partir de `APP_URL`.

O arquivo `vercel.json` coloca as funções na região de São Paulo (`gru1`), a mesma do
banco no Supabase.

## Licença

Projeto acadêmico, distribuído sob a licença MIT.
