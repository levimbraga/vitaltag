import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/app/_lib/sessao";

export default async function Inicio() {
  redirect((await usuarioDaSessao()) ? "/painel" : "/entrar");
}
