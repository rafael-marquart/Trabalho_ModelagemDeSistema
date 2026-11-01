"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * SPEC-012: "Cancelar candidatura" on the detail screen. It always asks for an explicit confirmation; the server checks
 * ownership, stage and job status again. "Voltar" (or Esc) leaves the application untouched.
 */
export default function CancelApplication({ applicationId, jobTitle }: { applicationId: string; jobTitle: string }) {
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
      const response = await fetch(`/api/candidato/candidaturas/${applicationId}/cancelar`, { method: "POST" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body.message || "Não foi possível cancelar a candidatura. Nada foi alterado.");
        setBusy(false); setOpen(false); router.refresh();
        return;
      }
      setOpen(false);
      router.replace(`/candidato/candidaturas/${applicationId}?cancelada=1`);
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao serviço. Nada foi alterado; tente novamente.");
      setBusy(false); setOpen(false);
    }
  }

  return <section className="job-detail-section cancel-application" aria-labelledby="cancel-title">
    <h2 id="cancel-title">Cancelar candidatura</h2>
    <p className="muted">Você pode cancelar enquanto a candidatura estiver em andamento e a vaga não estiver encerrada. O cancelamento não pode ser desfeito.</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button ref={triggerRef} type="button" className="danger-button" aria-haspopup="dialog" onClick={() => { setError(""); setOpen(true); }}>Cancelar candidatura</button>
    <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={textId} onCancel={(event) => { event.preventDefault(); close(); }}>
      {open ? <div className="confirm-dialog-body">
        <h2 id={titleId}>Cancelar candidatura?</h2>
        <p id={textId}>{`Tem certeza de que deseja cancelar sua candidatura para ${jobTitle}? Essa ação não poderá ser desfeita.`}</p>
        <p className="confirm-dialog-note">Sua candidatura será marcada como Cancelada e o histórico será preservado.</p>
        <div className="apply-actions">
          <button ref={backRef} type="button" className="secondary-button" disabled={busy} onClick={close}>Voltar</button>
          <button type="button" className="danger-button danger-button-solid" disabled={busy} onClick={confirm}>{busy ? "Cancelando…" : "Confirmar cancelamento"}</button>
        </div>
      </div> : null}
    </dialog>
  </section>;
}
