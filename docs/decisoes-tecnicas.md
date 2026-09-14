# Decisões técnicas

Registro aqui as decisões que tomei durante a implementação e o motivo de cada uma.

## Regras resolvidas sem alterar o modelo de dados

O modelo de dados entregue na Fase 1 não tem tabelas para tokens de recuperação,
sessões ou controle de bloqueio. Para manter o schema e o diagrama intactos,
resolvi as regras abaixo apenas com o que as tabelas existentes já oferecem.

- **Link de redefinição de senha (US03):** uso um token assinado com o `AUTH_SECRET`, válido por 30 minutos e vinculado a uma impressão do `senha_hash` atual; como a troca de senha muda o hash, o link perde a validade sozinho e não preciso de uma tabela de tokens.
- **Encerramento das sessões após a redefinição (US03):** a sessão JWT guarda a mesma impressão do `senha_hash` e é conferida a cada requisição, então todas as sessões caem com a troca de senha sem que eu precise de uma tabela de sessões.
- **Bloqueio por tentativas (US12):** conto em `acesso_publico` as falhas posteriores ao último sucesso ocorridas nos últimos 15 minutos e, com 5 ou mais, bloqueio até 15 minutos após a quinta falha mais recente, de modo que o bloqueio se desfaz sozinho quando as tentativas saem da janela, sem coluna de contador nem de bloqueio.
- **Retenção de 90 dias do histórico (US13):** apago os registros de `acesso_publico` com mais de 90 dias no momento em que gravo um novo acesso, sem depender de agendador nem de coluna extra.

## Ajustes de configuração

- **`AUTH_SECRET` gerado com openssl:** o comando `npx auth secret` hoje resolve para o CLI de outra biblioteca, então gerei o segredo com `openssl rand -base64 33`, que produz o mesmo tipo de valor aleatório.
- **Prisma fixado na versão 6.19:** a partir da versão 7 o `directUrl` deixa de existir no datasource, e o schema entregue depende dessa sintaxe.
- **Node 22 no CI:** o Vitest 5, que uso nos testes, exige Node 22 ou superior.
- **shadcn/ui com Base UI:** o estilo padrão atual do shadcn/ui usa Base UI e o pacote `cn` no lugar do Radix, e mantive o padrão da ferramenta.
- **Envio de e-mail pelo Resend:** a implementação está pronta, mas não foi testada por falta de chave de API; a demonstração usa a implementação de console, que exibe as mensagens no terminal do servidor.

## Acabamento e deploy

- **Indicador no link em vez de esqueleto de página:** um esqueleto de carregamento no painel fazia a página chegar em partes e deixou a navegação instável no ensaio da demonstração, então mantive o progresso nos botões e passei a mostrar um indicador no próprio link clicado.
- **Seed que recria a conta de demonstração:** o `npm run seed` apaga e recria a conta fictícia, para que cada gravação parta do mesmo estado.
- **Funções na região de São Paulo:** o `vercel.json` fixa a região `gru1`, a mesma do banco no Supabase, para reduzir a latência de cada consulta.
- **Prisma Client gerado no `postinstall`:** a Vercel reaproveita as dependências entre builds, e gerar o client na instalação evita usar uma versão desatualizada.
