"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import type { DadosFichaEntrada } from "@/application/ficha/esquemas";
import { MAX_CONTATOS_EMERGENCIA } from "@/domain/regras/politicas";
import {
  DESCRICAO_TIPO_SANGUINEO,
  ROTULO_SEXO,
  ROTULO_TIPO_SANGUINEO,
  SEXOS,
  type Sexo,
  TIPOS_SANGUINEOS,
  type TipoSanguineo,
} from "@/domain/tipos";
import type { EstadoFormulario } from "@/app/_lib/formulario";
import { Aviso } from "@/components/aviso";
import { CLASSE_BOTAO_GRANDE, CLASSE_TITULO_SECAO } from "@/components/estilos";
import { Campo } from "@/components/formulario/campo";
import { CampoSelecao } from "@/components/formulario/campo-selecao";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CabecalhoPagina } from "./cabecalho-pagina";
import { CampoSenhaPublica } from "./campo-senha-publica";
import { ConfirmacaoSenhaPublica } from "./confirmacao-senha-publica";
import { ListaDeItens } from "./lista-de-itens";

export interface ContatoFormulario {
  nome: string;
  telefone: string;
  parentesco: string;
}

export interface ValoresFicha {
  nome: string;
  sobrenome: string;
  sexo: Sexo;
  tipoSanguineo: TipoSanguineo | "";
  contatosEmergencia: ContatoFormulario[];
  alergias: string[];
  medicamentos: string[];
  doencas: string[];
  cirurgias: string[];
}

export type EnvioFicha = DadosFichaEntrada & { senhaPublica?: string };

const LISTAS = [
  { chave: "alergias", rotulo: "Alergias", exemplo: "Ex.: Dipirona" },
  { chave: "medicamentos", rotulo: "Medicamentos em uso", exemplo: "Ex.: Losartana 50 mg — 1x ao dia" },
  { chave: "doencas", rotulo: "Doenças", exemplo: "Ex.: Hipertensão arterial" },
  { chave: "cirurgias", rotulo: "Cirurgias realizadas", exemplo: "Ex.: Apendicectomia (2019)" },
] as const;

type ChaveLista = (typeof LISTAS)[number]["chave"];

const CONTATO_VAZIO: ContatoFormulario = { nome: "", telefone: "", parentesco: "" };

const VALORES_VAZIOS: ValoresFicha = {
  nome: "",
  sobrenome: "",
  sexo: "NAO_INFORMADO",
  tipoSanguineo: "",
  contatosEmergencia: [CONTATO_VAZIO],
  alergias: [],
  medicamentos: [],
  doencas: [],
  cirurgias: [],
};

export function FormularioFicha({
  acao,
  titulo,
  descricao,
  textoBotao,
  pedirSenhaPublica,
  valoresIniciais = VALORES_VAZIOS,
}: {
  acao: (estado: EstadoFormulario, dados: EnvioFicha) => Promise<EstadoFormulario>;
  titulo: string;
  descricao: string;
  textoBotao: string;
  pedirSenhaPublica: boolean;
  valoresIniciais?: ValoresFicha;
}) {
  const [valores, setValores] = useState(valoresIniciais);
  const [rascunhos, setRascunhos] = useState<Record<ChaveLista, string>>({
    alergias: "",
    medicamentos: "",
    doencas: "",
    cirurgias: "",
  });
  const [senhaPublica, setSenhaPublica] = useState("");
  const [estado, despachar, pendente] = useActionState(acao, {});

  useEffect(() => {
    if (estado.erros) document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [estado]);

  if (estado.sucesso && pedirSenhaPublica) {
    return (
      <ConfirmacaoSenhaPublica
        titulo="Ficha salva"
        descricao="Sua ficha clínica está ativa e o QR Code já pode ser usado."
        senha={senhaPublica}
      />
    );
  }

  const erro = (chave: string) => estado.erros?.[chave];
  const erroDaLista = (chave: ChaveLista) =>
    Object.entries(estado.erros ?? {}).find(([campo]) => campo === chave || campo.startsWith(`${chave}.`))?.[1];

  const atualizar = <K extends keyof ValoresFicha>(campo: K, valor: ValoresFicha[K]) =>
    setValores((atuais) => ({ ...atuais, [campo]: valor }));

  const atualizarContato = (indice: number, campo: keyof ContatoFormulario, valor: string) =>
    atualizar(
      "contatosEmergencia",
      valores.contatosEmergencia.map((contato, i) => (i === indice ? { ...contato, [campo]: valor } : contato)),
    );

  const enviar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();

    // Um item digitado e não adicionado ainda conta: seria fácil perdê-lo sem perceber.
    const itensDaLista = (chave: ChaveLista) => {
      const rascunho = rascunhos[chave].trim();
      const repetido = valores[chave].some((item) => item.toLowerCase() === rascunho.toLowerCase());
      const itens = rascunho && !repetido ? [...valores[chave], rascunho] : valores[chave];
      return itens.map((descricao) => ({ descricao }));
    };

    const dados: EnvioFicha = {
      nome: valores.nome,
      sobrenome: valores.sobrenome,
      sexo: valores.sexo,
      tipoSanguineo: valores.tipoSanguineo as TipoSanguineo,
      contatosEmergencia: valores.contatosEmergencia,
      alergias: itensDaLista("alergias"),
      medicamentos: itensDaLista("medicamentos"),
      doencas: itensDaLista("doencas"),
      cirurgias: itensDaLista("cirurgias"),
      ...(pedirSenhaPublica ? { senhaPublica } : {}),
    };
    startTransition(() => despachar(dados));
  };

  return (
    <>
      <CabecalhoPagina titulo={titulo} descricao={descricao} />

      <form onSubmit={enviar} noValidate className="flex flex-col gap-[18px]">
        {estado.mensagem && <Aviso tom="erro">{estado.mensagem}</Aviso>}

        <h2 className={CLASSE_TITULO_SECAO}>Identificação</h2>
        <Campo
          id="nome"
          rotulo="Nome"
          autoComplete="given-name"
          maxLength={80}
          value={valores.nome}
          onChange={(evento) => atualizar("nome", evento.target.value)}
          erros={erro("nome")}
        />
        <Campo
          id="sobrenome"
          rotulo="Sobrenome"
          autoComplete="family-name"
          maxLength={120}
          value={valores.sobrenome}
          onChange={(evento) => atualizar("sobrenome", evento.target.value)}
          erros={erro("sobrenome")}
        />
        <CampoSelecao
          id="sexo"
          rotulo="Sexo"
          value={valores.sexo}
          onChange={(evento) => atualizar("sexo", evento.target.value as Sexo)}
          erros={erro("sexo")}
        >
          {SEXOS.map((sexo) => (
            <option key={sexo} value={sexo}>
              {ROTULO_SEXO[sexo]}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao
          id="tipoSanguineo"
          rotulo="Tipo sanguíneo"
          value={valores.tipoSanguineo}
          onChange={(evento) => atualizar("tipoSanguineo", evento.target.value as TipoSanguineo)}
          erros={erro("tipoSanguineo")}
        >
          <option value="" disabled>
            Selecione
          </option>
          {TIPOS_SANGUINEOS.map((tipo) => (
            <option key={tipo} value={tipo}>
              {DESCRICAO_TIPO_SANGUINEO[tipo]} ({ROTULO_TIPO_SANGUINEO[tipo]})
            </option>
          ))}
        </CampoSelecao>

        <h2 className={CLASSE_TITULO_SECAO}>Contato de emergência</h2>
        {erro("contatosEmergencia") && (
          <p className="text-[13px] text-destructive">{erro("contatosEmergencia")?.[0]}</p>
        )}
        {valores.contatosEmergencia.map((contato, indice) => (
          <fieldset
            key={indice}
            className={cn("flex flex-col gap-[18px]", indice > 0 && "border-t pt-[18px]")}
          >
            <legend className="sr-only">Contato de emergência {indice + 1}</legend>
            {indice > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contato {indice + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() =>
                    atualizar(
                      "contatosEmergencia",
                      valores.contatosEmergencia.filter((_, i) => i !== indice),
                    )
                  }
                >
                  Remover contato
                </Button>
              </div>
            )}
            <Campo
              id={`contato-${indice}-nome`}
              rotulo="Nome do contato"
              autoComplete="off"
              maxLength={120}
              value={contato.nome}
              onChange={(evento) => atualizarContato(indice, "nome", evento.target.value)}
              erros={erro(`contatosEmergencia.${indice}.nome`)}
            />
            <Campo
              id={`contato-${indice}-telefone`}
              rotulo="Telefone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(11) 98877-6543"
              maxLength={20}
              value={contato.telefone}
              onChange={(evento) => atualizarContato(indice, "telefone", evento.target.value)}
              erros={erro(`contatosEmergencia.${indice}.telefone`)}
            />
            <Campo
              id={`contato-${indice}-parentesco`}
              rotulo="Parentesco"
              autoComplete="off"
              placeholder="Ex.: Mãe"
              maxLength={60}
              value={contato.parentesco}
              onChange={(evento) => atualizarContato(indice, "parentesco", evento.target.value)}
              erros={erro(`contatosEmergencia.${indice}.parentesco`)}
            />
          </fieldset>
        ))}
        {valores.contatosEmergencia.length < MAX_CONTATOS_EMERGENCIA && (
          <Button
            type="button"
            variant="ghost"
            className="self-start px-0 text-primary hover:bg-transparent hover:underline"
            onClick={() => atualizar("contatosEmergencia", [...valores.contatosEmergencia, CONTATO_VAZIO])}
          >
            + Adicionar outro contato
          </Button>
        )}

        <h2 className={CLASSE_TITULO_SECAO}>Informações clínicas</h2>
        {LISTAS.map((lista) => (
          <ListaDeItens
            key={lista.chave}
            id={lista.chave}
            rotulo={lista.rotulo}
            placeholder={lista.exemplo}
            itens={valores[lista.chave]}
            aoMudarItens={(itens) => atualizar(lista.chave, itens)}
            rascunho={rascunhos[lista.chave]}
            aoMudarRascunho={(texto) => setRascunhos((atuais) => ({ ...atuais, [lista.chave]: texto }))}
            erros={erroDaLista(lista.chave)}
          />
        ))}

        {pedirSenhaPublica && (
          <>
            <h2 className={CLASSE_TITULO_SECAO}>Acesso público</h2>
            <CampoSenhaPublica valor={senhaPublica} aoMudar={setSenhaPublica} erros={erro("senhaPublica")} />
          </>
        )}

        <button
          type="submit"
          disabled={pendente}
          aria-busy={pendente}
          className={cn(
            CLASSE_BOTAO_GRANDE,
            "mt-2 inline-flex items-center justify-center bg-primary text-primary-foreground transition-colors outline-none hover:bg-primary/85 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60",
          )}
        >
          {pendente ? "Salvando…" : textoBotao}
        </button>
      </form>
    </>
  );
}
