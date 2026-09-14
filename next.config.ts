import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O gerador de PDF roda como dependência do Node, sem passar pelo empacotador.
  serverExternalPackages: ["@react-pdf/renderer"],

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
