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

const FORMATO_DATA_EXTENSO = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: FUSO,
});

function partes(data: Date): Record<string, string> {
  return Object.fromEntries(PARTES_DATA_HORA.formatToParts(data).map(({ type, value }) => [type, value]));
}

export function formatarDataHora(data: Date): string {
  return FORMATO_DATA_HORA.format(data);
}

// Formato do protótipo: "30/08/2026, às 14h22".
export function formatarAtualizacao(data: Date): string {
  const p = partes(data);
  return `${p.day}/${p.month}/${p.year}, às ${p.hour}h${p.minute}`;
}

// "30/08/2026"
export function formatarData(data: Date): string {
  const p = partes(data);
  return `${p.day}/${p.month}/${p.year}`;
}

// "30 de agosto de 2026"
export function formatarDataExtenso(data: Date): string {
  return FORMATO_DATA_EXTENSO.format(data);
}

// "14:02"
export function formatarHora(data: Date): string {
  const p = partes(data);
  return `${p.hour}:${p.minute}`;
}
