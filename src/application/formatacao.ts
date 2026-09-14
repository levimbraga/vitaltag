const FUSO = "America/Sao_Paulo";

const FORMATO_DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: FUSO,
});

const PARTES_DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: FUSO,
});

export function formatarDataHora(data: Date): string {
  return FORMATO_DATA_HORA.format(data);
}

// Formato do protótipo: "30/08/2026, às 14h22".
export function formatarAtualizacao(data: Date): string {
  const partes = Object.fromEntries(
    PARTES_DATA_HORA.formatToParts(data).map(({ type, value }) => [type, value]),
  );
  return `${partes.day}/${partes.month}/${partes.year}, às ${partes.hour}h${partes.minute}`;
}
