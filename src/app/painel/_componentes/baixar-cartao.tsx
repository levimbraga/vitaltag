"use client";

import { useState } from "react";
import { CLASSE_LINK_PRIMARIO } from "@/components/estilos";

export const NOME_ARQUIVO_CARTAO = "cartao-vitaltag.pdf";

// Devolve a mensagem de erro, ou null quando o download começou.
export async function baixarCartaoPdf(senhaPublica: string): Promise<string | null> {
  try {
    const resposta = await fetch("/painel/cartao/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaPublica }),
    });

    const tipo = resposta.headers.get("content-type") ?? "";
    if (!tipo.includes("application/pdf")) {
      // Só digo que a sessão expirou quando é isso mesmo: resposta 401 ou o
      // middleware devolvendo a página de login no lugar do PDF.
      const foiParaLogin = resposta.redirected && new URL(resposta.url).pathname === "/entrar";
      if (resposta.status === 401 || foiParaLogin) {
        return "Sua sessão expirou. Entre novamente para gerar o cartão.";
      }
      const corpo = tipo.includes("application/json") ? await resposta.json().catch(() => null) : null;
      return corpo?.erro ?? "Não foi possível gerar o cartão agora. Tente novamente em instantes.";
    }

    const url = URL.createObjectURL(await resposta.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = NOME_ARQUIVO_CARTAO;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return null;
  } catch {
    return "Não foi possível gerar o cartão. Verifique a conexão e tente novamente.";
  }
}

export function BotaoBaixarCartao({ senhaPublica }: { senhaPublica: string }) {
  const [baixando, setBaixando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={baixando}
        aria-busy={baixando}
        className={CLASSE_LINK_PRIMARIO}
        onClick={async () => {
          setBaixando(true);
          setErro(await baixarCartaoPdf(senhaPublica));
          setBaixando(false);
        }}
      >
        {baixando ? "Gerando cartão…" : "Baixar cartão em PDF"}
      </button>
      {erro && (
        <p role="alert" className="text-[13px] text-destructive">
          {erro}
        </p>
      )}
    </div>
  );
}
