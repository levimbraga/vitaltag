import { CallbackRouteError, CredentialsSignin } from "@auth/core/errors";
import { describe, expect, it } from "vitest";
import { credencialNaoConfere } from "./erro-login";

describe("credencialNaoConfere", () => {
  it("reconhece e-mail ou senha que não conferem", () => {
    expect(credencialNaoConfere(new CredentialsSignin())).toBe(true);
  });

  it("não trata falha interna da verificação como senha errada", () => {
    const falhaDoBanco = new Error("the URL must start with the protocol `postgresql://`");

    expect(credencialNaoConfere(new CallbackRouteError("Read more", { cause: falhaDoBanco }))).toBe(false);
  });

  it("não trata outros erros como credencial inválida", () => {
    expect(credencialNaoConfere(new Error("falha qualquer"))).toBe(false);
    expect(credencialNaoConfere(null)).toBe(false);
  });
});
