# VitalTag

O VitalTag é um sistema web para cadastro e consulta de informações clínicas de
emergência. A ideia central do projeto é permitir que qualquer pessoa registre os
dados de saúde que precisam ser conhecidos rapidamente em uma situação crítica —
tipo sanguíneo, alergias, condições preexistentes, medicamentos em uso e contatos
de emergência — e que esses dados possam ser acessados por meio de um QR Code.

O QR Code aponta para uma página pública de leitura, mas o conteúdo da ficha só é
exibido depois que a pessoa que fez a leitura informa a senha de acesso definida
pelo titular. Assim, o socorrista ou acompanhante consegue chegar à informação em
segundos, sem que a ficha fique exposta para quem simplesmente escanear a etiqueta.

Este é um projeto acadêmico que desenvolvo individualmente, com foco em aplicar
arquitetura em camadas, tipagem forte e validação de dados em uma aplicação real.

## Funcionalidades

- Cadastro e autenticação de usuários com sessão persistente
- Criação e edição da ficha clínica pessoal
- Registro de tipo sanguíneo, sexo, data de nascimento e observações gerais
- Cadastro de múltiplos contatos de emergência com telefone e grau de parentesco
- Registro de itens clínicos por categoria (alergias, condições, medicamentos,
  cirurgias e outros registros relevantes)
- Geração de QR Code vinculado à ficha do usuário
- Página pública de emergência protegida por senha de acesso
- Definição e troca da senha de acesso público pelo titular da ficha
- Ativação e desativação do acesso público a qualquer momento
- Registro das consultas realizadas à ficha, com data e hora
- Validação de todos os dados de entrada no cliente e no servidor
- Interface responsiva, pensada primeiro para uso em celular

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
domínio, as regras de validação intrínsecas de cada entidade e as interfaces de
repositório. Não conhece Prisma, Next.js nem qualquer detalhe de entrega.

**Aplicação (`src/application`)**
Orquestra os casos de uso do sistema: criar ficha, adicionar contato de
emergência, definir a senha de acesso, validar a senha informada na página
pública, registrar uma consulta. Cada caso de uso recebe as dependências pelas
interfaces declaradas no domínio, o que torna essa camada testável sem banco de
dados. Os esquemas Zod de entrada dos casos de uso também vivem aqui.

**Infraestrutura (`src/infrastructure`)**
Implementa as interfaces do domínio com tecnologia concreta: repositórios Prisma,
cliente do banco, configuração do Auth.js, hash de senhas, geração de QR Code e
integrações externas. É a única camada que conhece detalhes de persistência.

**Apresentação (`src/app`)**
Rotas do App Router do Next.js, Server Components, Server Actions, Route Handlers
e componentes de interface. Recebe a requisição, valida a entrada com Zod, chama
o caso de uso correspondente e devolve a resposta renderizada. Não contém regra
de negócio.

O fluxo típico de uma requisição é: `app` → `application` → `domain`, com a
`infrastructure` injetada na fronteira para satisfazer as interfaces do domínio.

## Estrutura de pastas

```
vitaltag/
├── .github/
│   └── workflows/
│       └── ci.yml              # lint e testes em push e pull request
├── prisma/
│   └── schema.prisma           # modelo de dados e enums
├── src/
│   ├── app/                    # rotas, Server Actions e componentes de UI
│   ├── application/            # casos de uso e esquemas de validação
│   ├── domain/                 # entidades, tipos e interfaces de repositório
│   └── infrastructure/         # Prisma, autenticação e serviços externos
├── .gitignore
└── README.md
```

## Como executar localmente

```bash
npm install
cp .env.example .env      # preencher DATABASE_URL e as variáveis do Auth.js
npx prisma migrate dev
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

## Scripts

| Comando         | Descrição                             |
| --------------- | ------------------------------------- |
| `npm run dev`   | Ambiente de desenvolvimento           |
| `npm run build` | Build de produção                     |
| `npm run lint`  | Análise estática com ESLint           |
| `npm test`      | Execução da suíte de testes           |

## Licença

Projeto acadêmico, distribuído sob a licença MIT.
