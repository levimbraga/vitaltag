# Verificação das User Stories

Registro aqui como verifiquei cada critério de aceite, fase a fase. Uso três métodos:

- **Unitário:** teste automatizado com Vitest (`npm test`), sem banco de dados, usando dublês
  das interfaces do domínio.
- **Navegador:** roteiro automatizado no Chromium contra o build de produção
  (`npm run build && npm start`), em tela de 390px de largura, com dados fictícios que removo
  do banco ao final. Quando o critério depende do que foi gravado, o roteiro também consulta o
  banco pelo Prisma.
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
| As ações gerar cartão, editar e excluir estão visíveis e acessíveis por teclado. | Navegador | Navegando só com Tab, o foco passou por "Editar ficha clínica", "Gerar nova senha de acesso" e "Excluir ficha". A ação de gerar cartão será verificada na Fase E, junto com o PDF. |
| A data e a hora da última atualização da ficha são apresentadas. | Navegador | Ver US04. |

### US06 — Edição da ficha clínica

| Critério de aceite | Método | Como verifiquei |
| --- | --- | --- |
| O formulário de edição abre preenchido com os dados atuais. | Navegador | Nome, tipo sanguíneo, segundo contato e os itens de alergias e cirurgias apareceram preenchidos. A senha pública não é pedida nem exibida. |
| A alteração é confirmada por mensagem de sucesso e reflete imediatamente na página pública. | Navegador e unitário | Após salvar, o painel exibiu "Ficha atualizada." e o banco registrou o novo tipo sanguíneo e a alergia removida. A página pública continuou respondendo no mesmo endereço; a exibição dos dados atualizados nela será verificada na Fase E, quando o acesso por senha estiver pronto. |
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
