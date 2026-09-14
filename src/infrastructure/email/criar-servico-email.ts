import type { ServicoEmail } from "@/domain/servicos/servico-email";
import type { Ambiente } from "@/infrastructure/config/ambiente";
import { ConsoleServicoEmail } from "./console-servico-email";
import { ResendServicoEmail } from "./resend-servico-email";

export function criarServicoEmail(env: Ambiente): ServicoEmail {
  if (env.EMAIL_PROVIDER === "resend") {
    if (env.RESEND_API_KEY) return new ResendServicoEmail(env.RESEND_API_KEY, env.EMAIL_FROM);
    console.warn("EMAIL_PROVIDER=resend sem RESEND_API_KEY: os e-mails serão apenas exibidos no console.");
  }
  return new ConsoleServicoEmail();
}
