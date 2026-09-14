const FORMATO_DATA_HORA = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatarDataHora(data: Date): string {
  return FORMATO_DATA_HORA.format(data);
}
