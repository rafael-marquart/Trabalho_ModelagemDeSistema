import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import JobSearch from "@/components/candidate/job-search";
import { getCurrentUser } from "@/lib/auth/session";
import { searchQuerySchema } from "@/lib/jobs/search";

type Params = Record<string, string | string[] | undefined>;

export default async function CandidateJobsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const raw = await searchParams;
  const asList = (value: string | string[] | undefined) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
  const parsed = searchQuerySchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined, cargo: asList(raw.cargo), area: asList(raw.area), modalidade: asList(raw.modalidade),
    local: asList(raw.local), acessibilidade: asList(raw.acessibilidade), ordem: typeof raw.ordem === "string" ? raw.ordem : undefined,
    pagina: typeof raw.pagina === "string" ? raw.pagina : undefined
  });
  const initialQuery = parsed.success ? parsed.data : searchQuerySchema.parse({});
  return <CompanyShell role="CANDIDATE" active="jobs" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="candidate-jobs-title">
      <header className="company-page-heading">
        <p className="eyebrow">Área do candidato</p>
        <h1 id="candidate-jobs-title">Vagas para você</h1>
        <p className="muted">A compatibilidade é calculada automaticamente com o seu perfil. Clique no círculo para ver as pontuações e o tempo até o trabalho.</p>
      </header>
      <JobSearch initialQuery={initialQuery} />
    </main>
  </CompanyShell>;
}
