"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Invitation = { id: string; status: "PENDING" | "REFUSED" | "EXPIRED" | "CANCELLED" | "ACCEPTED"; expiresAt: string; createdAt: string; respondedAt: string | null };
const labels: Record<Invitation["status"], string> = { PENDING: "Pendente", REFUSED: "Recusado", EXPIRED: "Expirado", CANCELLED: "Cancelado", ACCEPTED: "Aceito" };

export default function CompanyRecruitersPage() {
  const [email, setEmail] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/company/recruiter-invitations", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) { setError(true); setMessage(result.message || "Não foi possível carregar os convites."); return; }
      setInvitations(result.invitations); setError(false); setMessage("");
    } catch { setError(true); setMessage("Não foi possível conectar ao serviço."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/company/recruiter-invitations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const result = await response.json();
      setMessage(result.message || (response.ok ? "Solicitação processada." : "Não foi possível enviar o convite."));
      setError(!response.ok);
      if (response.ok) { setEmail(""); await load(); }
    } catch { setError(true); setMessage("Não foi possível conectar ao serviço."); }
    finally { setLoading(false); }
  }

  async function cancel(invitationId: string) {
    setLoading(true); setMessage(""); setError(false);
    try {
      const response = await fetch("/api/company/recruiter-invitations/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ invitationId }) });
      const result = await response.json(); setMessage(result.message || "Não foi possível cancelar."); setError(!response.ok);
      await load();
    } catch { setError(true); setMessage("Não foi possível conectar ao serviço."); }
    finally { setLoading(false); }
  }

  return <main className="auth-page">
    <Link className="brand auth-brand" href="/empresa"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link>
    <section className="auth-card" aria-labelledby="recruiters-title">
      <Link className="back-link" href="/empresa">← Voltar à área da empresa</Link>
      <p className="eyebrow">Gestão organizacional</p><h1 id="recruiters-title">Recrutadores</h1>
      <p className="muted">Convide uma conta existente de recrutador pelo e-mail. O convite é válido por 7 dias.</p>
      <form className="auth-form" onSubmit={send}>
        <label htmlFor="recruiter-email">E-mail da conta do recrutador</label>
        <input id="recruiter-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} />
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Processando…" : "Enviar convite"}</button>
      </form>
      {message && <p className={error ? "form-error" : "muted"} role={error ? "alert" : "status"} aria-live="polite">{message}</p>}
      <h2 className="section-heading">Convites enviados</h2>
      {invitations.length === 0 ? <p className="muted">Nenhum convite registrado.</p> : <ul className="invitation-list">{invitations.map(invitation => <li key={invitation.id} className="invitation-item">
        <div><strong>{labels[invitation.status]}</strong><p className="muted">Enviado em {new Date(invitation.createdAt).toLocaleDateString("pt-BR")} · Válido até {new Date(invitation.expiresAt).toLocaleDateString("pt-BR")}</p></div>
        {invitation.status === "PENDING" && <button className="secondary-button" disabled={loading} onClick={() => void cancel(invitation.id)}>Cancelar</button>}
      </li>)}</ul>}
    </section>
  </main>;
}
