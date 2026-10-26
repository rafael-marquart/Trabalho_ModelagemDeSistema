"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import React, { FormEvent, useCallback, useEffect, useState } from "react";

type Invitation = {
  id: string;
  status: "PENDING" | "REFUSED" | "EXPIRED" | "CANCELLED" | "ACCEPTED";
  expiresAt: string;
  createdAt: string;
  respondedAt: string | null;
  recipient: { fullName: string; email: string };
};
type RecruiterLink = {
  id: string;
  createdAt: string;
  recruiter: { fullName: string; email: string; isActive: boolean };
};

const labels: Record<Invitation["status"], string> = {
  PENDING: "Solicitação pendente",
  REFUSED: "Recusado",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
  ACCEPTED: "Aceito"
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function CompanyRecruitersPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [links, setLinks] = useState<RecruiterLink[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmingLinkId, setConfirmingLinkId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [invitationResponse, linksResponse] = await Promise.all([
        fetch("/api/company/recruiter-invitations", { cache: "no-store" }),
        fetch("/api/company/recruiter-links", { cache: "no-store" })
      ]);
      const [invitationResult, linksResult] = await Promise.all([
        invitationResponse.json(),
        linksResponse.json()
      ]);
      if (!invitationResponse.ok || !linksResponse.ok) {
        setError(true);
        setMessage(invitationResult.message || linksResult.message || "Não foi possível carregar os recrutadores.");
        return;
      }
      setInvitations(invitationResult.invitations);
      setLinks(linksResult.links);
    } catch {
      setError(true);
      setMessage("Não foi possível conectar ao serviço.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/company/recruiter-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName })
      });
      const result = await response.json();
      if (response.ok) {
        setEmail("");
        setFullName("");
        await load();
      }
      setMessage(result.message || (response.ok ? "Solicitação processada." : "Não foi possível enviar o convite."));
      setError(!response.ok);
    } catch {
      setError(true);
      setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  async function resendInvitation(invitation: Invitation) {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/company/recruiter-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: invitation.recipient.email,
          fullName: invitation.recipient.fullName
        })
      });
      const result = await response.json();
      if (response.ok) await load();
      setMessage(result.message || (response.ok ? "Convite reenviado." : "Não foi possível reenviar o convite."));
      setError(!response.ok);
    } catch {
      setError(true);
      setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  async function cancel(invitationId: string) {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/company/recruiter-invitations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId })
      });
      const result = await response.json();
      await load();
      setMessage(result.message || "Não foi possível cancelar.");
      setError(!response.ok);
    } catch {
      setError(true);
      setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  async function endLink(recruiterLinkId: string) {
    setLoading(true);
    setMessage("");
    setError(false);
    try {
      const response = await fetch("/api/company/recruiter-links/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterLinkId })
      });
      const result = await response.json();
      if (response.ok) {
        setConfirmingLinkId(null);
        await load();
      }
      setMessage(result.message || (response.ok ? "Vínculo encerrado." : "Não foi possível encerrar o vínculo."));
      setError(!response.ok);
    } catch {
      setError(true);
      setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="company-dashboard">
      <header className="company-topbar">
        <Link className="company-brand" href="/empresa" aria-label="Acessa Vagas — área da empresa">
          <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
        </Link>
        <span className="company-topbar-label">Área da empresa</span>
        <div className="company-topbar-actions">
          <ThemeToggle />
          <span className="company-avatar" aria-hidden="true">AV</span>
        </div>
      </header>

      <div className="company-dashboard-body">
        <aside className="company-sidebar">
          <p className="company-sidebar-title">MENU DA EMPRESA</p>
          <nav className="company-nav" aria-label="Menu da empresa">
            <Link className="company-nav-item" href="/empresa/recrutadores" aria-current="page">Recrutadores</Link>
            <Link className="company-nav-item" href="/empresa">Área da empresa</Link>
          </nav>
        </aside>

        <main className="company-content" aria-labelledby="recruiters-title">
          <header className="company-page-heading">
            <h1 id="recruiters-title">Gestão de recrutadores</h1>
            <p className="muted">Gerencie quem pode atuar nos processos seletivos da sua empresa.</p>
          </header>

          <section className="invite-panel" aria-labelledby="invite-title">
            <h2 id="invite-title">Convidar recrutador</h2>
            <p className="muted">A pessoa receberá um link de uso único para aceitar o vínculo e, se necessário, configurar sua senha.</p>
            <form className="invite-form" onSubmit={send}>
              <div className="invite-form-field">
                <label htmlFor="recruiter-name">Nome completo</label>
                <input
                  id="recruiter-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  required
                  minLength={2}
                  maxLength={160}
                />
              </div>
              <div className="invite-form-field">
                <label htmlFor="recruiter-email">E-mail</label>
                <input
                  id="recruiter-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  maxLength={254}
                />
              </div>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Processando…" : "Enviar convite"}
              </button>
            </form>
          </section>

          {message && (
            <p
              className={"company-message " + (error ? "form-error" : "muted")}
              role={error ? "alert" : "status"}
              aria-live={error ? "assertive" : "polite"}
            >
              {message}
            </p>
          )}

          <section className="recruiter-table-panel" aria-labelledby="people-title">
            <h2 id="people-title" className="section-heading">Pessoas vinculadas</h2>
            <p className="muted">A lista apresenta as solicitações e os vínculos da empresa; o envio não confirma a elegibilidade do e-mail informado.</p>
            <div className="table-scroll">
              <table className="recruiter-table">
                <caption className="visually-hidden">Vínculos ativos e convites de recrutadores da empresa</caption>
                <thead>
                  <tr>
                    <th scope="col">Recrutador</th>
                    <th scope="col">E-mail</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => (
                    <tr key={"link-" + link.id}>
                      <td>
                        <strong>{link.recruiter.fullName}</strong>
                        <p className="muted">Vínculo desde {formatDate(link.createdAt)}</p>
                        {confirmingLinkId === link.id && (
                          <p className="muted" role="status">
                            Encerrar o vínculo removerá o acesso organizacional, mas preservará a conta e o histórico de ações.
                          </p>
                        )}
                      </td>
                      <td>{link.recruiter.email}</td>
                      <td>
                        <span className={"status-pill " + (link.recruiter.isActive ? "status-active" : "status-neutral")}>
                          {link.recruiter.isActive ? "Ativo" : "Conta desativada"}
                        </span>
                      </td>
                      <td>
                        {confirmingLinkId === link.id ? (
                          <div className="table-actions">
                            <button className="secondary-button" type="button" disabled={loading} onClick={() => void endLink(link.id)}>
                              {loading ? "Processando…" : "Confirmar"}
                            </button>
                            <button className="secondary-button" type="button" disabled={loading} onClick={() => setConfirmingLinkId(null)}>
                              Voltar
                            </button>
                          </div>
                        ) : (
                          <button
                            className="secondary-button"
                            type="button"
                            disabled={loading}
                            aria-label={"Encerrar vínculo de " + link.recruiter.fullName}
                            onClick={() => setConfirmingLinkId(link.id)}
                          >
                            Encerrar vínculo
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {invitations.filter(invitation => invitation.status !== "ACCEPTED").map(invitation => (
                    <tr key={"invitation-" + invitation.id}>
                      <td>
                        <strong>{invitation.recipient.fullName}</strong>
                        <p className="muted">Convite enviado em {formatDate(invitation.createdAt)} · Válido até {formatDate(invitation.expiresAt)}</p>
                      </td>
                      <td>{invitation.recipient.email}</td>
                      <td>
                        <span className={"status-pill status-" + invitation.status.toLowerCase()}>
                          {labels[invitation.status]}
                        </span>
                      </td>
                      <td>
                        {invitation.status === "PENDING" ? (
                          <div className="table-actions">
                            <button
                              className="secondary-button"
                              type="button"
                              disabled={loading}
                              aria-label={"Reenviar convite para " + invitation.recipient.fullName}
                              onClick={() => void resendInvitation(invitation)}
                            >
                              Reenviar
                            </button>
                            <button
                              className="secondary-button"
                              type="button"
                              disabled={loading}
                              aria-label={"Cancelar convite para " + invitation.recipient.fullName}
                              onClick={() => void cancel(invitation.id)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <span aria-hidden="true">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {links.length + invitations.length === 0 && (
                    <tr>
                      <td className="empty-table-cell" colSpan={4}>Nenhum recrutador ou convite registrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
