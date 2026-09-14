# Verificação das User Stories

Registro aqui como verifiquei cada critério de aceite, fase a fase. Uso três métodos:

- **Unitário:** teste automatizado com Vitest (`npm test`), sem banco de dados, usando dublês
  das interfaces do domínio.
- **Navegador:** roteiro automatizado no Chromium contra o build de produção
  (`npm run build && npm start`), em tela de 390px de largura, com dados fictícios que removo
  do banco ao final. Quando o critério depende do que foi gravado, o roteiro também consulta o
  banco pelo Prisma; quando depende de arquivo gerado, o roteiro inspeciona o arquivo baixado.
- **Inspeção:** leitura do código ou da configuração responsável pelo comportamento.

Quando um critério não foi verificado por completo, deixo isso escrito na própria linha.

## Fase C — Contas e acesso

Roteiro de navegador executado em 14/09/2026: 25 verificações, todas aprovadas.

### US01 — Cadastro de usuário

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O formulário exige nome, e-mail e senha; nenhum campo pode ser enviado vazio. | Navegador e inspeção | Enviar o formulário totalmente vazio exibiu erro em nome, e-mail e senha (roteiro da Fase D). Senha curta e senha sem número exibiram a mensagem correspondente. `cadastroUsuarioSchema` exige conteúdo em nome e e-mail. |
| O e-mail é validado por formato e recusado com mensagem clara caso já exista conta associada. | Unitário, navegador e inspeção | `contas.test.ts` recusa e-mail já cadastrado. No navegador, cadastrar o mesmo e-mail em maiúsculas exibiu "Já existe uma conta com este e-mail.". O formato é validado por `z.email()` no esquema. |
| A senha exige no mínimo 8 caracteres, com ao menos uma letra e um número. | Unitário e navegador | `contas.test.ts` recusa senha curta, sem número e sem letra. No navegador, senha curta e senha só com letras exibiram a mensagem correspondente. |
| Após o cadastro bem-sucedido o usuário é redirecionado autenticado ao painel. | Navegador | O envio válido levou a `/painel` com a saudação do usuário. |

Complemento do protótipo: a confirmação de senha diferente exibiu "As senhas não conferem.", e nome e
e-mail permaneceram preenchidos após cada erro.

### US02 — Login e logout

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| Credenciais corretas iniciam a sessão e levam ao painel. | Unitário e navegador | `contas.test.ts` autentica com credenciais corretas. No navegador, o login levou a `/painel`. |
| Credenciais incorretas exibem mensagem genérica, sem revelar se o e-mail existe. | Unitário e navegador | `contas.test.ts` devolve o mesmo resultado para senha errada e e-mail inexistente, calculando um hash descartável no segundo caso. No navegador, os dois casos exibiram exatamente "E-mail ou senha incorretos.". |
| A sessão expira automaticamente após 30 minutos de inatividade. | Navegador e inspeção | O cookie de sessão foi emitido com validade de 1799 s e teve o prazo renovado numa requisição seguinte ao painel. `auth.config.ts` define `maxAge` de 30 minutos e o middleware renova a sessão em `/painel`. Não aguardei 30 minutos reais. |
| O logout encerra a sessão e o botão voltar do navegador não restaura a área autenticada. | Navegador e inspeção | Após o logout, o cookie de sessão deixou de existir e voltar duas vezes no histórico não exibiu o painel. O painel envia `Cache-Control: no-store`, o logout usa navegação completa e a página recarrega se for restaurada do cache. |

Complemento: acessar `/painel` sem sessão redirecionou para o login.

### US03 — Recuperação de senha

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O usuário informa o e-mail e recebe link de redefinição válido por 30 minutos. | Unitário e navegador | `contas.test.ts` envia o link e o recusa ao completar 30 minutos. `hmac.test.ts` recusa token adulterado ou assinado com outro segredo. No navegador, o link apareceu no terminal do servidor e a troca foi concluída. |
| A mesma mensagem de confirmação é exibida mesmo que o e-mail não exista na base. | Unitário e navegador | `contas.test.ts` termina sem erro e sem envio para e-mail inexistente. No navegador, as confirmações com e sem conta foram idênticas e só a conta existente recebeu mensagem. |
| O link é de uso único e expira imediatamente após a troca da senha. | Unitário e navegador | `contas.test.ts` recusa o mesmo link numa segunda troca. No navegador, reutilizar o link exibiu "O link de redefinição é inválido ou expirou." e a senha informada nessa tentativa não foi aplicada. |
| Todas as sessões ativas são encerradas após a redefinição. | Unitário e navegador | `contas.test.ts` invalida a sessão aberta antes da troca. No navegador, uma sessão aberta em outro contexto foi levada ao login logo após a redefinição. A senha antiga deixou de funcionar e a nova funcionou. |

Envio real pelo Resend: não verificado, por falta de chave de API. A demonstração usa a
implementação de console.

Responsividade: as telas de entrar, cadastro e recuperação não apresentaram rolagem horizontal
a 320px.

## Fase D — Ficha clínica

Roteiro de navegador executado em 14/09/2026: 51 verificações, todas aprovadas.

O roteiro revelou dois defeitos, que corrigi antes de fechar a fase:

- Ao salvar a ficha, a revalidação do painel renderizava de novo a página de cadastro, que
  redirecionava para a edição e escondia a confirmação com a senha pública. Removi a revalidação
  dessa ação.
- O botão "Ir para o painel" reaproveitava uma versão do painel guardada antes do cadastro e
  mostrava a ficha como pendente. Passei a usar navegação completa nesse botão.

### US04 — Cadastro da ficha clínica

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O formulário contém nome, sobrenome, sexo, contato de emergência, tipo sanguíneo, alergias, medicamentos, doenças e cirurgias. | Navegador | O roteiro preencheu todos esses campos e conferiu no banco o que foi gravado. |
| Nome, sobrenome, tipo sanguíneo e contato de emergência são obrigatórios; os demais são opcionais. | Unitário e navegador | `ficha.test.ts` recusa a ficha sem esses campos. No navegador, o envio vazio marcou nome, sobrenome, tipo sanguíneo e os três campos do contato, sem erro nas quatro listas, e levou o foco ao primeiro campo com erro. |
| O tipo sanguíneo é selecionado em lista fechada com as oito combinações ABO/Rh. | Navegador e unitário | O campo ofereceu exatamente A+, A−, B+, B−, AB+, AB−, O+ e O−. `ficha.test.ts` recusa valor fora do enum. |
| Alergias, medicamentos, doenças e cirurgias aceitam múltiplos itens adicionados individualmente. | Unitário e navegador | `ficha.test.ts` grava cada lista em `registro_clinico` com o tipo correspondente. No navegador, os itens foram adicionados um a um por Enter e pelo botão, a repetição foi ignorada, a remoção funcionou, e o banco registrou cada item com o enum `tipo` correto. Um item digitado e não adicionado também foi salvo. |
| Ao salvar, a ficha é exibida no painel com a data da última atualização. | Navegador e unitário | Após salvar, o painel exibiu "Ficha ativa e publicada" e "Última atualização em 14/09/2026, às 19h33.". `formatacao.test.ts` confere o formato e o fuso de Brasília. |

Complemento: é possível cadastrar até três contatos, gravados com prioridade 1, 2 e 3.

### US05 — Painel do usuário

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O painel indica se a ficha está ativa ou pendente de preenchimento. | Navegador | Antes do cadastro o painel exibiu "Ficha pendente de preenchimento"; depois, "Ficha ativa e publicada". Após a exclusão, voltou a indicar pendente. |
| O QR Code vigente é exibido junto do link público correspondente. | Navegador e unitário | O painel exibiu o QR Code gerado no servidor e o link `APP_URL/f/<slug>` igual ao `slug_publico` do banco. `qr-code.test.ts` confere que o conteúdo codificado é somente essa URL. |
| As ações gerar cartão, editar e excluir estão visíveis e acessíveis por teclado. | Navegador | Navegando só com Tab, o foco passou por "Ver cartão para impressão", "Editar ficha clínica", "Histórico de acessos", "Gerar nova senha de acesso" e "Excluir ficha" (roteiro da Fase E). |
| A data e a hora da última atualização da ficha são apresentadas. | Navegador | Ver US04. |

### US06 — Edição da ficha clínica

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O formulário de edição abre preenchido com os dados atuais. | Navegador | Nome, tipo sanguíneo, segundo contato e os itens de alergias e cirurgias apareceram preenchidos. A senha pública não é pedida nem exibida. |
| A alteração é confirmada por mensagem de sucesso e reflete imediatamente na página pública. | Navegador e unitário | Após salvar, o painel exibiu "Ficha atualizada." e o banco registrou o novo tipo sanguíneo e a alergia removida. No roteiro da Fase E, uma alergia acrescentada na edição apareceu na página pública no acesso seguinte. |
| A URL pública e o QR Code impresso permanecem os mesmos após a edição. | Unitário e navegador | `ficha.test.ts` preserva o slug público. No navegador, o `slug_publico` no banco e o link do painel continuaram iguais aos anteriores. |
| O sistema registra a data e a hora da alteração. | Navegador | `atualizada_em` avançou no banco após a edição. |

### US07 — Exclusão da ficha clínica

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| A exclusão exige confirmação explícita em caixa de diálogo com aviso de irreversibilidade. | Unitário e navegador | `ficha.test.ts` recusa a exclusão sem confirmação. No navegador, a caixa de diálogo exibiu o aviso de irreversibilidade, manteve o botão desabilitado até digitar EXCLUIR, e fechou sem excluir por "Cancelar" e pela tecla Esc. |
| Os dados clínicos são removidos definitivamente da base após a confirmação. | Unitário e navegador | `ficha.test.ts` remove a ficha. No navegador, após confirmar, o banco não tinha mais a ficha, os registros clínicos nem os contatos. |
| O link público passa a retornar HTTP 404 com página informando que a ficha não está mais disponível. | Navegador | O endereço público antigo respondeu HTTP 404 com a página "Ficha indisponível". Endereços com UUID inexistente ou malformado também responderam 404. |
| A conta do usuário é preservada, permitindo o cadastro de uma nova ficha. | Unitário e navegador | `ficha.test.ts` mantém o usuário. No navegador, o usuário continuou logado, o painel voltou a indicar ficha pendente e o formulário de nova ficha abriu. |

### US08 — Senha de acesso público

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| A senha de acesso público é definida no cadastro da ficha e é diferente da senha de conta. | Unitário e navegador | `ficha.test.ts` recusa senha pública igual à da conta. No navegador, o cadastro pediu a senha pública e recusou a mesma senha da conta com "A senha de acesso público deve ser diferente da senha da conta.". |
| A senha aceita de 4 a 8 caracteres, para permitir digitação rápida em emergência. | Unitário e navegador | `ficha.test.ts` recusa "123", "123456789" e "12 34". No navegador, "12" e "abc" foram recusadas e o campo não aceitou mais de 8 caracteres. |
| A senha é armazenada com hash e nunca é exibida novamente em tela após a definição. | Navegador e inspeção | O banco guardou um hash Argon2id que não contém a senha. A senha apareceu apenas na confirmação imediata; não constava no painel, e a tela de senha pública abriu com o campo vazio. `ObterFichaDoTitular` retira o hash antes de devolver a ficha. |
| O usuário pode gerar uma nova senha pública a qualquer momento. | Unitário e navegador | `ficha.test.ts` troca a senha pública. No navegador, a tela de senha pública gerou uma senha aleatória de 6 dígitos no cadastro e definiu uma nova depois, substituindo o hash no banco. |

Responsividade: painel, formulário da ficha, senha pública e página indisponível não apresentaram
rolagem horizontal a 320px.

## Fase E — QR Code e acesso público

Roteiro de navegador executado em 14/09/2026: 56 verificações, todas aprovadas na primeira execução.

Para os arquivos gerados, o roteiro usou `pdfinfo` e `pdftotext` (tamanho da página, texto e
posição das palavras no PDF), `pdftoppm` (rasterização do cartão a 300 dpi) e o decodificador de
QR Code `jsQR` sobre as imagens.

### US09 — Geração do QR Code

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O QR Code é gerado a partir de uma URL pública única e não sequencial (UUID). | Unitário e navegador | `qr-code.test.ts` confere que o conteúdo é `APP_URL/f/<slug>`. No navegador, o PNG baixado decodificou para essa URL, com um UUID versão 4 igual ao `slug_publico` do banco. |
| O código é exibido em tela e pode ser baixado em PNG com no mínimo 512x512 pixels. | Unitário e navegador | `qr-code.test.ts` eleva qualquer tamanho menor a 512 pixels. No navegador, o QR Code aparece no painel e na tela "Seu QR Code", e o PNG baixado tem 1024x1024 pixels. |
| A leitura do código por qualquer aplicativo padrão de câmera abre a página de senha. | Navegador | Decodifiquei o PNG baixado e o cartão rasterizado; abrir a URL lida retornou a página que pede a senha. Não testei com a câmera de um celular físico: a leitura foi feita por decodificador de software. |
| O QR Code não contém a senha de acesso público em seu conteúdo. | Unitário e navegador | `qr-code.test.ts` e `cartao.test.ts` conferem que a senha não entra no conteúdo codificado. No navegador, nem o PNG nem o QR Code do cartão continham a senha. |

### US10 — Cartão para impressão

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O sistema gera um PDF em tamanho crachá contendo o QR Code e o nome do titular. | Navegador | O PDF baixado tem página de 242,6 x 153,1 pt, que corresponde a 85,6 x 54 mm (padrão ID-1), e o texto extraído contém o nome do titular. |
| A senha de acesso público aparece em campo destacado, fora da área do QR Code. | Navegador e inspeção | A posição extraída do PDF colocou a senha em x = 132,8 pt, à direita do QR Code, que ocupa de 9 a 93 pt. `cartao-pdf.tsx` desenha a senha numa coluna própria, com borda e fundo destacados. |
| O PDF inclui a instrução de leitura e o aviso de uso exclusivo para emergências. | Navegador | O texto extraído contém "Aponte a câmera do celular para o código e informe a senha", "EMERGÊNCIA MÉDICA" e "Uso exclusivo em situações de emergência médica.". |
| O arquivo é baixado com o QR Code legível após impressão em 300 dpi. | Navegador | Rasterizei o PDF a 300 dpi (1012x638 pixels) e o QR Code foi decodificado para a URL pública. Não fiz uma impressão física. |

Download logo após definir a senha: na confirmação da senha pública, a tela indica "Este é o
momento mais simples de gerar o cartão." e o PDF foi baixado sem digitar a senha de novo. Fora desse
momento, a tela do cartão exigiu a senha: com a senha incorreta não houve download, e com a correta
o PDF foi baixado. `cartao.test.ts` confirma que nada é gerado com a senha incorreta.

### US11 — Visualização pública da ficha

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| A leitura do QR Code abre a página pública solicitando a senha de acesso. | Navegador | A URL decodificada do QR Code abriu a página com o campo de senha. O HTML inicial, renderizado no servidor, não contém nenhum dado da ficha. |
| Com a senha correta, a ficha é exibida com tipo sanguíneo e alergias em destaque no topo. | Unitário e navegador | `acesso.test.ts` libera a ficha com tipo sanguíneo e alergias. No navegador, as seções apareceram na ordem tipo sanguíneo, alergias, medicamentos, doenças, cirurgias e contatos, com as alergias em destaque vermelho. O contato tem botão de ligar. |
| Com a senha incorreta, é exibida mensagem de erro sem revelar qualquer dado da ficha. | Unitário e navegador | `acesso.test.ts` devolve apenas o status de senha incorreta. No navegador, a mensagem "Senha incorreta." apareceu e a página não continha nome, alergias, medicamentos, contato nem tipo sanguíneo. |
| A página funciona sem login e é legível em tela de celular. | Navegador e inspeção | O acesso foi feito em contexto sem sessão, em tela de 390px, sem rolagem horizontal a 320px na página de senha e na ficha liberada. A ficha é renderizada no servidor e devolvida pela ação de acesso, sem mudar o endereço. |

### US12 — Bloqueio por tentativas

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| Após 5 tentativas incorretas consecutivas o acesso àquela ficha é bloqueado por 15 minutos. | Unitário e navegador | `bloqueio-acesso.test.ts` cobre 4 falhas na janela (liberado), 5 falhas (bloqueado) e 5 falhas com a mais antiga fora da janela (liberado). No navegador, a quinta falha bloqueou; depois de deslocar os registros 15 minutos para trás no banco, o acesso voltou a ser aceito. O tempo real de 15 minutos foi simulado. |
| A tela informa o bloqueio e o tempo restante, sem expor dados da ficha. | Navegador | A tela exibiu "Acesso bloqueado" com "Tente novamente em 14:54", sem dados da ficha, e continuou bloqueada ao recarregar. |
| O contador é reiniciado após um acesso bem-sucedido. | Unitário e navegador | `acesso.test.ts` e `bloqueio-acesso.test.ts` desconsideram falhas anteriores ao sucesso. No navegador, 4 falhas, um acesso correto e mais 4 falhas não bloquearam. |
| O titular é notificado por e-mail quando ocorre um bloqueio. | Unitário e navegador | `acesso.test.ts` avisa o titular uma única vez. No navegador, o bloqueio gerou exatamente um e-mail para o titular no console do servidor. O envio real pelo Resend não foi verificado. |

Complemento: uma página aberta antes do bloqueio enviou a senha correta durante ele; o acesso
continuou bloqueado e a tentativa não foi gravada no histórico.

### US13 — Histórico de acessos

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O painel lista data, hora e resultado (sucesso ou falha) de cada tentativa de acesso. | Navegador | A tela listou cada tentativa com data por extenso, hora e a marcação "Sucesso" ou "Senha incorreta", e o total exibido conferiu com o banco. |
| A lista é ordenada da mais recente para a mais antiga e paginada de 20 em 20 registros. | Unitário e navegador | `acesso.test.ts` lista 20 por página, do mais recente para o mais antigo. No navegador, com 40 registros, a primeira página mostrou 20 em ordem decrescente e a segunda continuou a sequência. |
| Os registros ficam retidos por 90 dias e são descartados automaticamente após esse prazo. | Unitário e navegador | `acesso.test.ts` descarta registros com mais de 90 dias ao gravar um acesso. No navegador, um registro de 91 dias inserido no banco foi removido no acesso seguinte à ficha. O descarte ocorre na gravação de um novo acesso, e não por agendamento. |
| Somente o titular autenticado consegue visualizar o histórico. | Unitário e navegador | `acesso.test.ts` não devolve registros a quem não é o titular. No navegador, outro usuário viu o histórico vazio, e o acesso sem sessão foi levado ao login. |

Responsividade: as telas de QR Code, cartão, histórico, página pública de senha, ficha liberada e
bloqueio não apresentaram rolagem horizontal a 320px.

## Fase F — Acabamento e ensaio da demonstração

Execuções de 14/09/2026, todas contra o build final de produção:

| Verificação | Método | Resultado |
| --- | --- | --- |
| Ensaio do roteiro de demonstração, na mesma sequência de telas e com os mesmos valores usados na gravação, cobrindo as 13 user stories a partir da conta criada pelo seed. | Navegador | 24 verificações, todas aprovadas. |
| Regressão dos roteiros das fases C, D e E. | Navegador | 25, 51 e 56 verificações, todas aprovadas. |
| O seed cria a conta de demonstração com ficha completa e histórico. | Navegador | A conta ficou com 8 registros clínicos, 2 contatos e 24 acessos, e o login funcionou com as credenciais documentadas no README. |
| Endereço inexistente mostra página de erro própria. | Navegador | Respondeu HTTP 404 com a página "Página não encontrada". |
| Falhas inesperadas mostram tela de erro com opção de tentar novamente. | Inspeção | Há telas de erro na raiz, no painel e na página pública, e uma tela global para falhas no layout. Não provoquei uma falha real de banco para exibi-las. |
| Estados de carregamento. | Navegador e inspeção | Os botões exibem o progresso durante o envio ("Entrando…", "Salvando…", "Gerando cartão…", "Verificando…"), conferido nos roteiros anteriores. Os links do painel mostram um indicador enquanto a próxima tela carrega. |
| Responsividade a partir de 320px. | Navegador | Entrar, cadastro, recuperação, redefinição, página 404 e ficha indisponível sem rolagem horizontal a 320px. Somadas às fases anteriores, todas as telas foram verificadas nessa largura. |

Testei também um esqueleto de carregamento para o painel e o removi: ele fazia a página chegar em
partes, e o ensaio mostrou telas ainda sem conteúdo logo após a navegação e uma navegação que não
terminou.

Na primeira versão deste registro a Fase E constava com 58 verificações; o total correto é 56.
