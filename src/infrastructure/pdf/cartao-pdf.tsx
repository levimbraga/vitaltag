import { Document, Image, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { DadosCartaoImpressao } from "@/domain/servicos/gerador-cartao-pdf";

// Tamanho de crachá padrão (ISO/IEC 7810 ID-1): 85,6 x 54 mm, convertido para pontos.
const PONTOS_POR_MM = 72 / 25.4;
const LARGURA = 85.6 * PONTOS_POR_MM;
const ALTURA = 54 * PONTOS_POR_MM;

const COR = {
  primaria: "#393683",
  primariaSuave: "#ECECF6",
  texto: "#1A1A2E",
  secundaria: "#6B6B8A",
  borda: "#E2E2EF",
  emergencia: "#D92D20",
};

const estilos = StyleSheet.create({
  pagina: { padding: 9, backgroundColor: "#FFFFFF", fontFamily: "Helvetica", color: COR.texto },
  cabecalho: { borderBottomWidth: 0.75, borderBottomColor: COR.borda, paddingBottom: 4 },
  selo: { fontFamily: "Helvetica-Bold", fontSize: 7, color: COR.emergencia, letterSpacing: 0.8 },
  nome: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 1.5, maxLines: 1, textOverflow: "ellipsis" },
  corpo: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  qrCode: { width: 84, height: 84 },
  coluna: { flex: 1, marginLeft: 8 },
  instrucao: { fontSize: 6.8, color: COR.secundaria, lineHeight: 1.3 },
  caixaSenha: {
    marginTop: 4,
    paddingVertical: 3.5,
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: COR.primaria,
    borderRadius: 4,
    backgroundColor: COR.primariaSuave,
  },
  rotuloSenha: { fontFamily: "Helvetica-Bold", fontSize: 5.5, color: COR.primaria, letterSpacing: 0.6 },
  senha: { fontFamily: "Courier-Bold", fontSize: 15, color: COR.primaria, letterSpacing: 2.5, marginTop: 1 },
  url: { fontSize: 5.5, color: COR.secundaria, marginTop: 4 },
  aviso: {
    position: "absolute",
    left: 9,
    right: 9,
    bottom: 7,
    fontFamily: "Helvetica-Bold",
    fontSize: 6,
    color: COR.emergencia,
    textAlign: "center",
  },
});

// O texto é só referência para quem não conseguir ler o código; o QR Code leva a URL completa.
function urlResumida(url: string): string {
  const semProtocolo = url.replace(/^https?:\/\//, "");
  const [dominio, slug = ""] = semProtocolo.split("/f/");
  return slug.length > 12 ? `${dominio}/f/${slug.slice(0, 4)}…${slug.slice(-4)}` : semProtocolo;
}

function Cartao({ dados }: { dados: DadosCartaoImpressao }) {
  const qrCode = `data:image/png;base64,${Buffer.from(dados.qrCodePng).toString("base64")}`;

  return (
    <Document title={`Cartão VitalTag - ${dados.nomeTitular}`} author="VitalTag" creator="VitalTag">
      <Page size={[LARGURA, ALTURA]} style={estilos.pagina}>
        <View style={estilos.cabecalho}>
          <Text style={estilos.selo}>EMERGÊNCIA MÉDICA</Text>
          <Text style={estilos.nome}>{dados.nomeTitular}</Text>
        </View>

        {/* A senha fica numa coluna separada, fora da área do QR Code. */}
        <View style={estilos.corpo}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- imagem de PDF, sem atributo alt */}
          <Image src={qrCode} style={estilos.qrCode} />
          <View style={estilos.coluna}>
            <Text style={estilos.instrucao}>
              Aponte a câmera do celular para o código e informe a senha:
            </Text>
            <View style={estilos.caixaSenha}>
              <Text style={estilos.rotuloSenha}>SENHA DE ACESSO</Text>
              <Text style={estilos.senha}>{dados.senhaPublica}</Text>
            </View>
            <Text style={estilos.url}>{urlResumida(dados.urlPublica)}</Text>
          </View>
        </View>

        <Text style={estilos.aviso}>Uso exclusivo em situações de emergência médica.</Text>
      </Page>
    </Document>
  );
}

export async function renderizarCartao(dados: DadosCartaoImpressao): Promise<Uint8Array> {
  return new Uint8Array(await renderToBuffer(<Cartao dados={dados} />));
}
