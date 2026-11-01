"use client";

import React, { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { UNREAD_EVENT } from "./events";

type Notice = { id: string; createdAt: string; read: boolean; title: string; body: string; href: string };
type Data = { notices: Notice[]; unread: number; emailNotifications: "ON" | "OFF" };

const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(", ", " às ");
const announce = (unread: number) => window.dispatchEvent(new CustomEvent(UNREAD_EVENT, { detail: unread }));

/**
 * SPEC-017 (decision of 01/11/2026): the person's notices inside the site, most recent first. Opening one marks it as
 * read; the e-mail copy can be switched off here. The notice points to the official state; it never replaces it.
 */
export default function NotificationsCenter() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const emailId = useId();

  const load = useCallback(async () => {
    const response = await fetch("/api/notificacoes", { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.message || "Não foi possível carregar as notificações."); return; }
    setData(body as Data);
    announce((body as Data).unread);
  }, []);
  useEffect(() => { load().catch(() => setError("Não foi possível conectar ao serviço. Atualize a página.")); }, [load]);

  async function markRead(id?: string) {
    const response = await fetch("/api/notificacoes/lidas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : {}) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return;
    setData((current) => current && { ...current, unread: body.unread, notices: current.notices.map((notice) => (!id || notice.id === id ? { ...notice, read: true } : notice)) });
    announce(body.unread);
    if (!id) setStatus("Todas as notificações foram marcadas como lidas.");
  }

  async function toggleEmail(on: boolean) {
    setSaving(true); setStatus("");
    try {
      const response = await fetch("/api/conta/preferencias", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferences: { EMAIL_NOTIFICATIONS: on ? "ON" : "OFF" } }) });
      if (!response.ok) { setStatus("Não foi possível salvar a preferência. Tente novamente."); return; }
      setData((current) => current && { ...current, emailNotifications: on ? "ON" : "OFF" });
      setStatus(on ? "Você também receberá os avisos por e-mail." : "Os avisos ficarão só aqui, sem e-mail.");
    } finally { setSaving(false); }
  }

  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!data) return <p className="muted" role="status">Carregando notificações…</p>;
  return <>
    <div className="notices-toolbar">
      <label className="notices-email" htmlFor={emailId}>
        <input id={emailId} type="checkbox" checked={data.emailNotifications === "ON"} disabled={saving} onChange={(event) => toggleEmail(event.target.checked)} />
        <span>Receber também por e-mail</span>
      </label>
      {data.unread ? <button type="button" className="secondary-button" onClick={() => markRead()}>Marcar todas como lidas</button> : null}
    </div>
    <p className="muted" role="status">{status || (data.unread ? `${data.unread} ${data.unread === 1 ? "notificação não lida" : "notificações não lidas"}.` : "Nenhuma notificação não lida.")}</p>
    {data.notices.length ? <ul className="notices-list">
      {data.notices.map((notice) => <li key={notice.id} className={`notice${notice.read ? "" : " notice-unread"}`}>
        <div className="notice-main">
          <p className="notice-meta">{notice.read ? <time dateTime={notice.createdAt}>{when(notice.createdAt)}</time> : <><span className="notice-dot" aria-hidden="true" /><span className="visually-hidden">Não lida. </span><time dateTime={notice.createdAt}>{when(notice.createdAt)}</time></>}</p>
          <h2 className="notice-title">{notice.title}</h2>
          <p className="notice-body">{notice.body}</p>
        </div>
        <div className="notice-actions">
          <Link className="text-link" href={notice.href} onClick={() => { if (!notice.read) void markRead(notice.id); }}>Ver detalhes →</Link>
          {notice.read ? null : <button type="button" className="link-button" onClick={() => markRead(notice.id)} aria-label={`Marcar como lida: ${notice.title}`}>Marcar como lida</button>}
        </div>
      </li>)}
    </ul> : <p className="job-empty">Você ainda não tem notificações. Elas aparecem aqui quando algo muda nas candidaturas.</p>}
  </>;
}
