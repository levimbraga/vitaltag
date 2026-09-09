# VitalTag — User Stories para abertura de issues

Cada bloco abaixo corresponde a uma issue do repositório. O título da issue é a
linha `###` e o corpo é todo o conteúdo até o separador.

---

### US01 — Cadastro de usuário

**História:** Como trabalhador, quero criar uma conta no sistema para armazenar minhas informações clínicas com segurança.

**Critérios de aceite:**
- [ ] O formulário exige nome, e-mail e senha; nenhum campo pode ser enviado vazio.
- [ ] O e-mail é validado por formato e recusado com mensagem clara caso já exista conta associada.
- [ ] A senha exige no mínimo 8 caracteres, com ao menos uma letra e um número.
- [ ] Após o cadastro bem-sucedido o usuário é redirecionado autenticado ao painel.

**Requisito de origem:** RF01
**Pacote da EAP:** 3.1 Contas e Acesso
**Sprint prevista:** Sprint 2

_Labels sugeridas: user-story, contas-e-acesso, sprint-2_

---

### US02 — Login e logout

**História:** Como trabalhador cadastrado, quero entrar e sair do sistema para controlar quem usa minha conta.

**Critérios de aceite:**
- [ ] Credenciais corretas iniciam a sessão e levam ao painel.
- [ ] Credenciais incorretas exibem mensagem genérica, sem revelar se o e-mail existe.
- [ ] A sessão expira automaticamente após 30 minutos de inatividade.
- [ ] O logout encerra a sessão e o botão voltar do navegador não restaura a área autenticada.

**Requisito de origem:** RF02
**Pacote da EAP:** 3.1 Contas e Acesso
**Sprint prevista:** Sprint 2

_Labels sugeridas: user-story, contas-e-acesso, sprint-2_

---

### US03 — Recuperação de senha

**História:** Como trabalhador, quero redefinir minha senha para recuperar o acesso caso eu a esqueça.

**Critérios de aceite:**
- [ ] O usuário informa o e-mail e recebe link de redefinição válido por 30 minutos.
- [ ] A mesma mensagem de confirmação é exibida mesmo que o e-mail não exista na base.
- [ ] O link é de uso único e expira imediatamente após a troca da senha.
- [ ] Todas as sessões ativas são encerradas após a redefinição.

**Requisito de origem:** RF03
**Pacote da EAP:** 3.1 Contas e Acesso
**Sprint prevista:** Sprint 2

_Labels sugeridas: user-story, contas-e-acesso, sprint-2_

---

### US04 — Cadastro da ficha clínica

**História:** Como trabalhador, quero cadastrar minhas informações clínicas para que sejam consultadas em caso de emergência.

**Critérios de aceite:**
- [ ] O formulário contém nome, sobrenome, sexo, contato de emergência, tipo sanguíneo, alergias, medicamentos, doenças e cirurgias.
- [ ] Nome, sobrenome, tipo sanguíneo e contato de emergência são obrigatórios; os demais são opcionais.
- [ ] O tipo sanguíneo é selecionado em lista fechada com as oito combinações ABO/Rh.
- [ ] Alergias, medicamentos, doenças e cirurgias aceitam múltiplos itens adicionados individualmente.
- [ ] Ao salvar, a ficha é exibida no painel com a data da última atualização.

**Requisito de origem:** RF04
**Pacote da EAP:** 3.2 Ficha Clínica
**Sprint prevista:** Sprint 3

_Labels sugeridas: user-story, ficha-clínica, sprint-3_

---

### US05 — Painel do usuário

**História:** Como trabalhador, quero visualizar um painel da minha ficha para saber o que já está cadastrado e publicado.

**Critérios de aceite:**
- [ ] O painel indica se a ficha está ativa ou pendente de preenchimento.
- [ ] O QR Code vigente é exibido junto do link público correspondente.
- [ ] As ações gerar cartão, editar e excluir estão visíveis e acessíveis por teclado.
- [ ] A data e a hora da última atualização da ficha são apresentadas.

**Requisito de origem:** RF05
**Pacote da EAP:** 3.2 Ficha Clínica
**Sprint prevista:** Sprint 3

_Labels sugeridas: user-story, ficha-clínica, sprint-3_

---

### US06 — Edição da ficha clínica

**História:** Como trabalhador, quero editar minha ficha para manter meus dados clínicos sempre atualizados.

**Critérios de aceite:**
- [ ] O formulário de edição abre preenchido com os dados atuais.
- [ ] A alteração é confirmada por mensagem de sucesso e reflete imediatamente na página pública.
- [ ] A URL pública e o QR Code impresso permanecem os mesmos após a edição.
- [ ] O sistema registra a data e a hora da alteração.

**Requisito de origem:** RF06
**Pacote da EAP:** 3.2 Ficha Clínica
**Sprint prevista:** Sprint 3

_Labels sugeridas: user-story, ficha-clínica, sprint-3_

---

### US07 — Exclusão da ficha clínica

**História:** Como trabalhador, quero excluir minha ficha para que meus dados de saúde deixem de ser acessíveis.

**Critérios de aceite:**
- [ ] A exclusão exige confirmação explícita em caixa de diálogo com aviso de irreversibilidade.
- [ ] Os dados clínicos são removidos definitivamente da base após a confirmação.
- [ ] O link público passa a retornar HTTP 404 com página informando que a ficha não está mais disponível.
- [ ] A conta do usuário é preservada, permitindo o cadastro de uma nova ficha.

**Requisito de origem:** RF07
**Pacote da EAP:** 3.2 Ficha Clínica
**Sprint prevista:** Sprint 5

_Labels sugeridas: user-story, ficha-clínica, sprint-5_

---

### US08 — Senha de acesso público

**História:** Como trabalhador, quero definir uma senha de acesso público para que apenas quem tem meu crachá veja minha ficha.

**Critérios de aceite:**
- [ ] A senha de acesso público é definida no cadastro da ficha e é diferente da senha de conta.
- [ ] A senha aceita de 4 a 8 caracteres, para permitir digitação rápida em emergência.
- [ ] A senha é armazenada com hash e nunca é exibida novamente em tela após a definição.
- [ ] O usuário pode gerar uma nova senha pública a qualquer momento.

**Requisito de origem:** RF08
**Pacote da EAP:** 3.3 QR Code e Acesso Público
**Sprint prevista:** Sprint 4

_Labels sugeridas: user-story, qr-code-e-acesso-público, sprint-4_

---

### US09 — Geração do QR Code

**História:** Como trabalhador, quero gerar um QR Code da minha ficha para colá-lo no verso do meu crachá.

**Critérios de aceite:**
- [ ] O QR Code é gerado a partir de uma URL pública única e não sequencial (UUID).
- [ ] O código é exibido em tela e pode ser baixado em PNG com no mínimo 512x512 pixels.
- [ ] A leitura do código por qualquer aplicativo padrão de câmera abre a página de senha.
- [ ] O QR Code não contém a senha de acesso público em seu conteúdo.

**Requisito de origem:** RF09
**Pacote da EAP:** 3.3 QR Code e Acesso Público
**Sprint prevista:** Sprint 4

_Labels sugeridas: user-story, qr-code-e-acesso-público, sprint-4_

---

### US10 — Cartão para impressão

**História:** Como trabalhador, quero imprimir um cartão com o QR Code para fixá-lo em meus equipamentos de trabalho.

**Critérios de aceite:**
- [ ] O sistema gera um PDF em tamanho crachá contendo o QR Code e o nome do titular.
- [ ] A senha de acesso público aparece em campo destacado, fora da área do QR Code.
- [ ] O PDF inclui a instrução de leitura e o aviso de uso exclusivo para emergências.
- [ ] O arquivo é baixado com o QR Code legível após impressão em 300 dpi.

**Requisito de origem:** RF10
**Pacote da EAP:** 3.3 QR Code e Acesso Público
**Sprint prevista:** Sprint 4

_Labels sugeridas: user-story, qr-code-e-acesso-público, sprint-4_

---

### US11 — Visualização pública da ficha

**História:** Como socorrista, quero acessar a ficha pelo QR Code e pela senha para prestar atendimento com informação correta.

**Critérios de aceite:**
- [ ] A leitura do QR Code abre a página pública solicitando a senha de acesso.
- [ ] Com a senha correta, a ficha é exibida com tipo sanguíneo e alergias em destaque no topo.
- [ ] Com a senha incorreta, é exibida mensagem de erro sem revelar qualquer dado da ficha.
- [ ] A página funciona sem login e é legível em tela de celular.

**Requisito de origem:** RF11
**Pacote da EAP:** 3.3 QR Code e Acesso Público
**Sprint prevista:** Sprint 4

_Labels sugeridas: user-story, qr-code-e-acesso-público, sprint-4_

---

### US12 — Bloqueio por tentativas

**História:** Como trabalhador, quero que tentativas repetidas de senha sejam bloqueadas para evitar que descubram meus dados por tentativa e erro.

**Critérios de aceite:**
- [ ] Após 5 tentativas incorretas consecutivas o acesso àquela ficha é bloqueado por 15 minutos.
- [ ] A tela informa o bloqueio e o tempo restante, sem expor dados da ficha.
- [ ] O contador é reiniciado após um acesso bem-sucedido.
- [ ] O titular é notificado por e-mail quando ocorre um bloqueio.

**Requisito de origem:** RF12
**Pacote da EAP:** 3.4 Auditoria
**Sprint prevista:** Sprint 5

_Labels sugeridas: user-story, auditoria, sprint-5_

---

### US13 — Histórico de acessos

**História:** Como trabalhador, quero ver o histórico de acessos à minha ficha para saber quando ela foi consultada.

**Critérios de aceite:**
- [ ] O painel lista data, hora e resultado (sucesso ou falha) de cada tentativa de acesso.
- [ ] A lista é ordenada da mais recente para a mais antiga e paginada de 20 em 20 registros.
- [ ] Os registros ficam retidos por 90 dias e são descartados automaticamente após esse prazo.
- [ ] Somente o titular autenticado consegue visualizar o histórico.

**Requisito de origem:** RF13
**Pacote da EAP:** 3.4 Auditoria
**Sprint prevista:** Sprint 5

_Labels sugeridas: user-story, auditoria, sprint-5_

---
