"use client";

// Último recurso, para falhas no próprio layout raiz: sem ele não há CSS nem fonte,
// por isso os estilos ficam no próprio elemento.
export default function ErroGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#F5F5FA",
          color: "#1A1A2E",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: 380 }}>
          <h1 style={{ fontSize: 26, margin: "0 0 12px" }}>Algo deu errado</h1>
          <p style={{ color: "#6B6B8A", lineHeight: 1.5 }}>
            O VitalTag não conseguiu carregar. Tente novamente em instantes.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 54,
              width: "100%",
              border: 0,
              borderRadius: 12,
              background: "#393683",
              color: "#FFFFFF",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
