"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Decision of 01/11/2026: "Remover da lista" for a refused or cancelled application, with confirmation. Only the
 * candidate's list changes; the record, the history and the company's view are kept.
 */
export default function HideApplication({ applicationId, jobTitle, afterHref }: { applicationId: string; jobTitle: string; afterHref?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
      backRef.current?.focus();
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    }
  }, [open]);

  const close = () => { if (busy) return; setOpen(false); triggerRef.current?.focus(); };

  async function confirm() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/candidato/candidaturas/${applicationId}/ocultar`, { method: "POST" });
      const body = await response.json().catch(() => ({}));
      setBusy(false); setOpen(false);
      if (!response.ok) { setError(body.message || "Não foi possível remover a candidatura da lista."); return; }
      if (afterHref) router.push(afterHref);
      router.refresh();
    } catch {
      setBusy(false); setOpen(false);
      setError("Não foi possível conectar ao serviço. Nada foi alterado; tente novamente.");
    }
  }

  return <>
    <button ref={triggerRef} type="button" className="link-button" aria-haspopup="dialog" onClick={() => { setError(""); setOpen(true); }}
      aria-label={`Remover da lista a candidatura para ${jobTitle}`}>Remover da lista</button>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={textId} onCancel={(event) => { event.preventDefault(); close(); }}>
      {open ? <div className="confirm-dialog-body">
        <h2 id={titleId}>Remover da lista?</h2>
        <p id={textId}>{`A candidatura para ${jobTitle} deixa de aparecer em Minhas candidaturas. Não é possível desfazer.`}</p>
        <p className="confirm-dialog-note">Nada é apagado: o registro e o histórico continuam guardados, e a empresa continua vendo a candidatura no processo seletivo.</p>
        <div className="apply-actions">
          <button ref={backRef} type="button" className="secondary-button" disabled={busy} onClick={close}>Voltar</button>
          <button type="button" className="primary-button" disabled={busy} onClick={confirm}>{busy ? "Removendo…" : "Remover da lista"}</button>
        </div>
      </div> : null}
    </dialog>
  </>;
}
