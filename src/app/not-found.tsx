import Link from "next/link";
import { CLASSE_LINK_PRIMARIO } from "@/components/estilos";
import { Logo } from "@/components/logo";

export default function PaginaNaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo className="mb-4" />
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">Página não encontrada</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        O endereço acessado não existe ou foi alterado.
      </p>
      <Link href="/" className={`${CLASSE_LINK_PRIMARIO} mt-4`}>
        Ir para o início
      </Link>
    </main>
  );
}
