import Link from "next/link";
import { CLASSE_LINK_TEXTO } from "@/components/estilos";
import { TextoDoLink } from "@/components/texto-do-link";

export function CabecalhoPagina({
  titulo,
  descricao,
  voltarPara = "/painel",
}: {
  titulo: string;
  descricao: string;
  voltarPara?: string;
}) {
  return (
    <header className="flex flex-col gap-3">
      <Link href={voltarPara} className={`${CLASSE_LINK_TEXTO} mb-1`}>
        <TextoDoLink>Voltar</TextoDoLink>
      </Link>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight">{titulo}</h1>
      <p className="text-[15px] leading-relaxed text-muted-foreground">{descricao}</p>
    </header>
  );
}
