import { usuarioDaSessao } from "@/app/_lib/sessao";
import { casosDeUso } from "@/infrastructure/container";

const TAMANHO_DOWNLOAD_PX = 1024;

export async function GET() {
  const usuario = await usuarioDaSessao();
  if (!usuario) return new Response("Sessão expirada. Entre novamente.", { status: 401 });

  const qrCode = await casosDeUso().gerarQrCodeDaFicha.png(usuario.id, TAMANHO_DOWNLOAD_PX);
  if (!qrCode) return new Response("Ficha clínica não encontrada.", { status: 404 });

  return new Response(Buffer.from(qrCode.png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="qrcode-vitaltag.png"',
      "Cache-Control": "no-store",
    },
  });
}
