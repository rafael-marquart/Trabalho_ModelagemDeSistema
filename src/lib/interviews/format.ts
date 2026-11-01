// Interview date in Brasília time ("terça-feira, 10/11/2026, às 14:30"), shared by server pages and client components.
export const interviewDateTime = (iso: string) => {
  const date = new Date(iso);
  const part = (options: Intl.DateTimeFormatOptions) => date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", ...options });
  return `${part({ weekday: "long" })}, ${part({ day: "2-digit", month: "2-digit", year: "numeric" })}, às ${part({ hour: "2-digit", minute: "2-digit" })}`;
};
