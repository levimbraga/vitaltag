import type { Metadata } from "next";

// Fichas públicas nunca devem aparecer em buscadores.
export const metadata: Metadata = {
  title: "Ficha de emergência · VitalTag",
  robots: { index: false, follow: false },
};

export default function LayoutPublico({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-6 pb-12 pt-16 sm:pt-24">
      {children}
    </main>
  );
}
