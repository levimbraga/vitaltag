export default function LayoutContas({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-6 pb-12 pt-12 sm:pt-16">
      {children}
    </main>
  );
}
