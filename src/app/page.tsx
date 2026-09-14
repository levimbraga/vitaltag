export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 text-center">
        <h1 className="text-2xl font-semibold text-primary">VitalTag</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ficha clínica de emergência acessível por QR Code.
        </p>
      </div>
    </main>
  );
}
