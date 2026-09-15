import { ZodError } from "zod";
import { ErroFichaNaoEncontrada, ErroSenhaPublicaIncorreta } from "@/domain/erros";
import { usuarioDaSessao } from "@/app/_lib/sessao";
import { casosDeUso } from "@/infrastructure/container";

// POST, e não GET: a senha pública vai no corpo e nunca aparece em URL ou histórico.
export async function POST(requisicao: Request) {
  const usuario = await usuarioDaSessao();
  if (!usuario) return Response.json({ erro: "Sessão expirada. Entre novamente." }, { status: 401 });

  const corpo = await requisicao.json().catch(() => null);
  const senhaPublica = typeof corpo?.senhaPublica === "string" ? corpo.senhaPublica : "";

  try {
    const pdf = await casosDeUso().gerarCartaoPdf.executar(usuario.id, { senhaPublica });
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="cartao-vitaltag.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (erro) {
    if (erro instanceof ZodError) {
      return Response.json({ erro: "Informe a senha de acesso público, com 4 a 8 letras ou números." }, { status: 400 });
    }
    if (erro instanceof ErroSenhaPublicaIncorreta) {
      return Response.json({ erro: "Senha de acesso público incorreta." }, { status: 422 });
    }
    if (erro instanceof ErroFichaNaoEncontrada) {
      return Response.json({ erro: erro.message }, { status: 404 });
    }
    // Falha na própria geração do PDF: registro o erro real e devolvo uma mensagem
    // honesta, em vez de uma resposta vazia que o navegador não sabe explicar.
    console.error("Falha ao gerar o cartão em PDF", erro);
    return Response.json(
      { erro: "Não foi possível gerar o cartão agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
