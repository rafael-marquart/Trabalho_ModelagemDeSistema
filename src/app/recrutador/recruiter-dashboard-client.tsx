"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/icons";

type Overview = {
  link: { id: string; createdAt: string; companyName: string } | null;
  invitations: { id: string; createdAt: string; expiresAt: string; companyName: string }[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function RecruiterHomePage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/recruiter/invitations", { cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Não foi possível carregar seus vínculos.");
        if (active) setOverview(result);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar seus vínculos. Atualize a página para tentar novamente.");
      });
    return () => { active = false; };
  }, []);

  return (
    <main id="conteudo" className="company-content" aria-labelledby="recruiter-home-title">
          <div className="recruiter-heading">
            <div>
              <p className="eyebrow">Área do recrutador</p>
              <h1 id="recruiter-home-title">Seu espaço no Acessa Vagas</h1>
              <p className="muted">Acompanhe seus vínculos organizacionais e os convites recebidos.</p>
            </div>
          </div>

          {error && <p className="company-message form-error" role="alert">{error}</p>}

          <div className="recruiter-overview-grid">
            <article className="recruiter-overview-card recruiter-primary-card">
              <div className="recruiter-card-icon"><Icon name="building" /></div>
              <p className="recruiter-card-kicker">Vínculo atual</p>
              {overview === null && !error ? (
                <p className="muted">Carregando suas informações…</p>
              ) : error ? (
                <p className="muted">Não foi possível carregar o vínculo.</p>
              ) : overview?.link ? (
                <>
                  <h2>{overview.link.companyName}</h2>
                  <span className="status-pill status-active">Vínculo ativo</span>
                  <p className="muted">Vinculado desde {formatDate(overview.link.createdAt)}.</p>
                </>
              ) : (
                <>
                  <h2>Nenhuma empresa vinculada</h2>
                  <p className="muted">Quando aceitar um convite válido, a empresa aparecerá aqui.</p>
                </>
              )}
            </article>

            <article className="recruiter-overview-card">
              <div className="recruiter-card-icon"><Icon name="mail" /></div>
              <p className="recruiter-card-kicker">Convites pendentes</p>
              <h2>{overview === null ? "—" : overview.invitations.length}</h2>
              <p className="muted">Convites aguardando sua resposta.</p>
            </article>
          </div>

          <section className="recruiter-invitations-panel" aria-labelledby="recruiter-invitations-title">
            <div className="recruiter-panel-heading">
              <div>
                <h2 id="recruiter-invitations-title">Convites recebidos</h2>
                <p className="muted">Para aceitar ou recusar, abra o link de uso único enviado ao seu e-mail.</p>
              </div>
            </div>
            {overview === null && !error ? (
              <p className="muted">Carregando convites…</p>
            ) : error ? (
              <p className="muted">Não foi possível carregar os convites.</p>
            ) : overview?.invitations.length === 0 ? (
              <div className="recruiter-empty-state">
                <span aria-hidden="true">✓</span>
                <div><strong>Você está em dia</strong><p className="muted">Não há convites pendentes no momento.</p></div>
              </div>
            ) : (
              <ul className="recruiter-invitation-list">
                {(overview?.invitations ?? []).map(invitation => (
                  <li key={invitation.id} className="recruiter-invitation-row">
                    <div className="recruiter-invitation-symbol" aria-hidden="true">↗</div>
                    <div className="recruiter-invitation-details">
                      <strong>{invitation.companyName}</strong>
                      <p className="muted">Recebido em {formatDate(invitation.createdAt)} · válido até {formatDate(invitation.expiresAt)}</p>
                    </div>
                    <span className="status-pill status-pending">Aguardando resposta</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
    </main>
  );
}
