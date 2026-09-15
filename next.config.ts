import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O gerador de PDF roda como dependência do Node, sem passar pelo empacotador.
  serverExternalPackages: ["@react-pdf/renderer"],

  // O react-pdf carrega as fontes padrão (Helvetica, Courier) por subcaminhos do
  // pacote pdfkit que o rastreamento de arquivos não segue. Sem incluí-las aqui, a
  // função publicada não encontra a fonte e o cartão em PDF falha só em produção.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/pdfkit/js/standard-fonts/**/*"],
  },

  async headers() {
    return [
      {
        // A área autenticada nunca deve ser guardada pelo navegador: depois do
        // logout, o botão voltar não pode restaurá-la.
        source: "/painel/:caminho*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
