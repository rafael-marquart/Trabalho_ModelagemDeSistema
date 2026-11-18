// Names of the authorized external sources, as shown to people (attribution required by OPEN-086).
const labels: Record<string, string> = { ADZUNA: "Adzuna" };

export const sourceLabel = (source: string | null | undefined) => (source ? labels[source] ?? source : "fonte externa");
