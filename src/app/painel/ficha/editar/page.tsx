import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { FichaDoTitular } from "@/application/ficha/obter-ficha-do-titular";
import { registrosDoTipo } from "@/domain/entidades/ficha-clinica";
import type { TipoRegistro } from "@/domain/tipos";
import { exigirUsuario } from "@/app/_lib/sessao";
import { casosDeUso } from "@/infrastructure/container";
import { FormularioFicha, type ValoresFicha } from "../../_componentes/formulario-ficha";
import { atualizarFicha } from "../acoes";

export const metadata: Metadata = { title: "Editar ficha clínica · VitalTag" };

function paraValoresDoFormulario(ficha: FichaDoTitular): ValoresFicha {
  const descricoes = (tipo: TipoRegistro) => registrosDoTipo(ficha, tipo).map((registro) => registro.descricao);

  return {
    nome: ficha.nome,
    sobrenome: ficha.sobrenome,
    sexo: ficha.sexo,
    tipoSanguineo: ficha.tipoSanguineo,
    contatosEmergencia: ficha.contatosEmergencia.map(({ nome, telefone, parentesco }) => ({
      nome,
      telefone,
      parentesco,
    })),
    alergias: descricoes("ALERGIA"),
    medicamentos: descricoes("MEDICAMENTO"),
    doencas: descricoes("DOENCA"),
    cirurgias: descricoes("CIRURGIA"),
  };
}

export default async function PaginaEditarFicha() {
  const usuario = await exigirUsuario();
  const ficha = await casosDeUso().obterFichaDoTitular.executar(usuario.id);
  if (!ficha) redirect("/painel/ficha/nova");

  return (
    <FormularioFicha
      acao={atualizarFicha}
      titulo="Editar ficha clínica"
      descricao="O link público e o QR Code já impresso continuam os mesmos depois da edição."
      textoBotao="Salvar alterações"
      pedirSenhaPublica={false}
      valoresIniciais={paraValoresDoFormulario(ficha)}
    />
  );
}
