import { z } from "zod";

const esquemaAmbiente = z.object({
  APP_URL: z.url("APP_URL deve ser uma URL completa.").default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET ausente ou curto demais."),
  EMAIL_PROVIDER: z.enum(["console", "resend"]).default("console"),
  EMAIL_FROM: z.string().min(1).default("VitalTag <onboarding@resend.dev>"),
  RESEND_API_KEY: z.string().optional(),
});

export type Ambiente = z.infer<typeof esquemaAmbiente>;

let cache: Ambiente | undefined;

// Leio as variáveis sob demanda, e não no carregamento do módulo, para que o
// build não exija o .env completo.
export function ambiente(): Ambiente {
  if (!cache) {
    // Valores vazios contam como ausentes, como acontece com o .env.example copiado.
    const definidas = Object.fromEntries(
      Object.entries(process.env).filter(([, valor]) => valor !== ""),
    );
    cache = esquemaAmbiente.parse(definidas);
  }
  return cache;
}
