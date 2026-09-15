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

## Comportamentos definidos durante o desenvolvimento

- **Tentativas durante o bloqueio não são gravadas (US12):** o `acesso_publico` só registra sucesso ou falha, e se as tentativas feitas durante o bloqueio contassem como falha, a janela deslizante avançaria a cada uma e o bloqueio nunca terminaria.
- **Aviso ao titular só no primeiro bloqueio de uma sequência (US12):** com a janela deslizante, cada falha logo após a liberação bloqueia de novo por pouco tempo, e sem essa regra o titular receberia um e-mail a cada tentativa durante um ataque.
- **Download do cartão na confirmação da senha, sem redigitar (US10):** a senha pública só existe em hash, e a tela de confirmação é o único momento em que ela ainda está em memória no navegador do titular; fora dela, peço a senha de novo para imprimi-la.
- **Senha pública só com letras e números, e a gerada com 6 dígitos (US08):** sem símbolos, a senha é digitada rápido numa emergência, e a senha só com dígitos abre o teclado numérico do celular na página pública.
- **Exclusão exigindo digitar EXCLUIR (US07):** a caixa de diálogo pedida na US07 recebeu a confirmação digitada do protótipo, porque a exclusão apaga os dados clínicos definitivamente e derruba o QR Code já impresso.
- **Página pública sem cookie, pedindo a senha a cada recarga (US11):** a ficha liberada é devolvida pela ação do servidor sem deixar nada salvo no aparelho, o que protege celulares compartilhados e faz de cada visualização uma tentativa registrada no histórico.
- **Até 3 contatos de emergência (US04):** o modelo permite vários contatos com prioridade, e três cobrem os casos comuns sem alongar a ficha que o socorrista precisa ler.
- **Paginação do histórico com "Anterior" e "Próxima" (US13):** o protótipo usava "Carregar mais", mas páginas fixas de 20 registros cumprem literalmente o critério de paginação de 20 em 20.

## Acabamento e deploy

- **Indicador no link em vez de esqueleto de página:** um esqueleto de carregamento no painel fazia a página chegar em partes e deixou a navegação instável no ensaio da demonstração, então mantive o progresso nos botões e passei a mostrar um indicador no próprio link clicado.
- **Seed que recria a conta de demonstração:** o `npm run seed` apaga e recria a conta fictícia, para que cada gravação parta do mesmo estado.
- **Funções na região de São Paulo:** o `vercel.json` fixa a região `gru1`, a mesma do banco no Supabase, para reduzir a latência de cada consulta.
- **Prisma Client gerado no `postinstall`:** a Vercel reaproveita as dependências entre builds, e gerar o client na instalação evita usar uma versão desatualizada.

## Ajustes após o primeiro deploy

- **Falha interna no login não aparece como senha errada (US02):** o critério pede mensagem genérica para credenciais incorretas, e eu exibia "E-mail ou senha incorretos." para qualquer erro de autenticação; no primeiro deploy, uma `DATABASE_URL` mal cadastrada na Vercel apareceu como senha incorreta, então restringi a mensagem ao caso em que e-mail e senha não conferem, e as demais falhas abrem a tela de erro e ficam registradas no log. A mensagem continua sem revelar se o e-mail existe.
- **Fontes padrão do PDF incluídas no rastreamento de arquivos (US10):** o react-pdf carrega Helvetica e Courier por subcaminhos do pacote pdfkit que o rastreamento do Next.js não segue, e a função publicada na Vercel ficava sem esses arquivos; incluí a pasta das fontes em `outputFileTracingIncludes`, o que resolve sem trocar a fonte do cartão.
- **Erro real ao gerar o cartão (US10):** a falha na geração do PDF chegava ao navegador como resposta vazia e aparecia como "sessão expirada", então passei a registrá-la no log e a mostrar uma mensagem de erro verdadeira, reservando o aviso de sessão expirada para quando ela de fato expirou.
