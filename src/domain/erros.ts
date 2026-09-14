export abstract class ErroDeDominio extends Error {}

export class ErroEmailJaCadastrado extends ErroDeDominio {
  constructor() {
    super("Já existe uma conta com este e-mail.");
  }
}

export class ErroUsuarioNaoEncontrado extends ErroDeDominio {
  constructor() {
    super("Usuário não encontrado.");
  }
}

export class ErroTokenInvalido extends ErroDeDominio {
  constructor() {
    super("O link de redefinição é inválido ou expirou. Solicite um novo.");
  }
}

export class ErroFichaJaExiste extends ErroDeDominio {
  constructor() {
    super("Você já possui uma ficha clínica cadastrada.");
  }
}

export class ErroFichaNaoEncontrada extends ErroDeDominio {
  constructor() {
    super("Ficha clínica não encontrada.");
  }
}

export class ErroSenhaPublicaIgualSenhaConta extends ErroDeDominio {
  constructor() {
    super("A senha de acesso público deve ser diferente da senha da conta.");
  }
}

export class ErroSenhaPublicaIncorreta extends ErroDeDominio {
  constructor() {
    super("Senha de acesso público incorreta.");
  }
}
