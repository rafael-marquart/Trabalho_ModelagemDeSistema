"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Invitation = { id: string; status: "PENDING" | "REFUSED" | "EXPIRED" | "CANCELLED" | "ACCEPTED"; expiresAt: string; createdAt: string; respondedAt: string | null };
type RecruiterLink = { id: string; createdAt: string; recruiter: { fullName: string; email: string; isActive: boolean } };
const labels: Record<Invitation["status"], string> = { PENDING: "Pendente", REFUSED: "Recusado", EXPIRED: "Expirado", CANCELLED: "Cancelado", ACCEPTED: "Aceito" };

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
      const [invitationResult, linksResult] = await Promise.all([invitationResponse.json(), linksResponse.json()]);
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
    setLoading(true); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/company/recruiter-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName })
      });
      const result = await response.json();
      if (response.ok) {
        setEmail(""); setFullName("");
        await load();
      }
      setMessage(result.message || (response.ok ? "Solicitação processada." : "Não foi possível enviar o convite."));
      setError(!response.ok);
    } catch {
      setError(true); setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  async function cancel(invitationId: string) {
    setLoading(true); setMessage(""); setError(false);
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
      setError(true); setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  async function endLink(recruiterLinkId: string) {
    setLoading(true); setMessage(""); setError(false);
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
      setError(true); setMessage("Não foi possível conectar ao serviço.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
    
    <Link className="brand auth-brand" href="/empresa"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link>
    <section className="auth-card" aria-labelledby="recruiters-title">
      <Link className="back-link" href="/empresa">← Voltar à área da empresa</Link>
      <p className="eyebrow">Gestão organizacional</p><h1 id="recruiters-title">Recrutadores</h1>
      <p className="muted">Convide recrutadores e acompanhe os vínculos da sua empresa. Se a pessoa ainda não tiver conta, poderá definir uma senha e aceitar o vínculo pelo link enviado. O convite é válido por 7 dias.</p>
      <form className="auth-form" onSubmit={send}>
        <label htmlFor="recruiter-name">Nome completo do recrutador</label>
        <input id="recruiter-name" type="text" autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} required minLength={2} maxLength={160} />
        <label htmlFor="recruiter-email">E-mail do recrutador</label>
        <input id="recruiter-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} />
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Processando…" : "Enviar convite"}</button>
      </form>
      {message && <p className={error ? "form-error" : "muted"} role={error ? "alert" : "status"} aria-live="polite">{message}</p>}

      <h2 className="section-heading">Recrutadores vinculados</h2>
      {links.length === 0 ? <p className="muted">Nenhum vínculo ativo registrado.</p> : <ul className="invitation-list">{links.map(link => <li key={link.id} className="invitation-item">
        <div>
          <strong>{link.recruiter.fullName}</strong>
          <p className="muted">{link.recruiter.email} · Vínculo desde {new Date(link.createdAt).toLocaleDateString("pt-BR")}</p>
          <p className="muted">{link.recruiter.isActive ? "Conta ativa" : "Conta desativada"}</p>
          {confirmingLinkId === link.id && <p className="muted" role="status">Encerrar o vínculo removerá o acesso organizacional, mas preservará a conta e o histórico de ações.</p>}
        </div>
        <div>
          {confirmingLinkId === link.id ? <>
            <button className="secondary-button" type="button" disabled={loading} onClick={() => void endLink(link.id)}>{loading ? "Processando…" : "Confirmar encerramento"}</button>
            <button className="secondary-button" type="button" disabled={loading} onClick={() => setConfirmingLinkId(null)}>Voltar</button>
          </> : <button className="secondary-button" type="button" disabled={loading} onClick={() => setConfirmingLinkId(link.id)}>Encerrar vínculo</button>}
        </div>
      </li>)}</ul>}

      <h2 className="section-heading">Convites enviados</h2>
      {invitations.length === 0 ? <p className="muted">Nenhum convite registrado.</p> : <ul className="invitation-list">{invitations.map(invitation => <li key={invitation.id} className="invitation-item">
        <div><strong>{labels[invitation.status]}</strong><p className="muted">Enviado em {new Date(invitation.createdAt).toLocaleDateString("pt-BR")} · Válido até {new Date(invitation.expiresAt).toLocaleDateString("pt-BR")}</p></div>
        {invitation.status === "PENDING" && <button className="secondary-button" type="button" disabled={loading} onClick={() => void cancel(invitation.id)}>Cancelar convite</button>}
      </li>)}</ul>}
    </section>
  </main>;
}
