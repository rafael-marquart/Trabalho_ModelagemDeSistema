import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import JobCard from "@/components/candidate/job-card";
import type { SearchJob } from "@/components/candidate/types";
import { getCurrentUser } from "@/lib/auth/session";
import { searchQuerySchema } from "@/lib/jobs/search";
import { searchJobsForCandidate } from "@/lib/jobs/search-service";

export default async function CandidateHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const firstName = user.fullName.split(/\s+/)[0] || user.fullName;
  let featured: SearchJob[] = [];
  let failed = false;
  try {
    featured = (await searchJobsForCandidate(user.id, searchQuerySchema.parse({}))).jobs.slice(0, 3) as SearchJob[];
  } catch (error) {
    // Logged on the server so a missing migration or database outage is visible in the terminal running the app.
    console.error("Falha ao carregar as vagas em destaque:", error instanceof Error ? error.message : error);
    failed = true;
  }
  return <CompanyShell role="CANDIDATE" active="home" userName={user.fullName}>
    <main className="company-content" aria-labelledby="candidate-home-title">
      <header className="company-page-heading candidate-home-heading">
        <div>
          <p className="eyebrow">Área do candidato</p>
          <h1 id="candidate-home-title">Olá, {firstName}!</h1>
          <p className="muted">Aqui você encontra vagas que combinam com o seu perfil.</p>
        </div>
        <Link className="secondary-button" href="/candidato/perfil">Ver meu perfil</Link>
      </header>
      <section className="candidate-featured" aria-labelledby="featured-title">
        <div className="section-heading-row">
          <h2 id="featured-title">Vagas em destaque</h2>
          <Link href="/candidato/vagas">Ver todas as vagas</Link>
        </div>
        {failed ? <p className="form-error" role="alert">Não foi possível carregar as vagas agora. Tente novamente em instantes.</p>
          : featured.length ? <div className="job-card-grid">{featured.map(job => <JobCard key={job.id} job={job} />)}</div>
            : <p className="muted">Ainda não há vagas elegíveis para o seu perfil. <Link href="/candidato/vagas">Buscar vagas</Link> ou <Link href="/candidato/perfil">completar o perfil</Link>.</p>}
      </section>
    </main>
  </CompanyShell>;
}
