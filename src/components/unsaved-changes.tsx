"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

type Pending = { kind: "link"; link: HTMLAnchorElement } | { kind: "form"; form: HTMLFormElement };

/**
 * Asks before leaving a page with unsaved changes (OPEN-101). While `dirty`:
 * - links and menus of the site (and "Sair da conta") open a dialog: "Salvar e sair", "Sair sem salvar", "Cancelar";
 *   forms that send something instead of saving it (a report, an evaluation) pass no `onSave` and get only
 *   "Sair sem enviar" and "Continuar preenchendo";
 * - closing the tab, reloading or typing another address show the browser's own warning (browsers allow no custom text).
 * `onSave` returns true when the save worked; on failure the dialog closes and the page shows its own error.
 */
export function useUnsavedChangesGuard({ dirty, onSave }: { dirty: boolean; onSave?: () => Promise<boolean> }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [saving, setSaving] = useState(false);
  const leavingRef = useRef(false);
  const bypassRef = useRef(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    if (!dirty) return;
    leavingRef.current = false;
    bypassRef.current = false;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const click = (event: MouseEvent) => {
      if (bypassRef.current) { bypassRef.current = false; return; } // the confirmed click, let the link navigate
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return; // another site: the browser's own warning covers it
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page (anchors)
      event.preventDefault();
      event.stopPropagation();
      setPending({ kind: "link", link });
    };
    const submit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form?.action || !new URL(form.action, window.location.href).pathname.startsWith("/api/auth/logout")) return;
      event.preventDefault();
      setPending({ kind: "form", form });
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    document.addEventListener("submit", submit, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
      document.removeEventListener("submit", submit, true);
    };
  }, [dirty]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pending && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    }
    if (!pending && dialog.open) {
      if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    }
  }, [pending]);

  const leave = useCallback((target: Pending) => {
    leavingRef.current = true;
    setPending(null);
    if (target.kind === "link") { bypassRef.current = true; target.link.click(); } // the link navigates as usual
    else target.form.submit(); // submit() does not fire the submit event again
  }, []);

  async function saveAndLeave() {
    if (!pending || !onSave) return;
    const target = pending;
    setSaving(true);
    try {
      const saved = await onSave();
      if (saved) leave(target); else setPending(null);
    } finally {
      setSaving(false);
    }
  }

  const dialog = <dialog ref={dialogRef} className="confirm-dialog unsaved-dialog" aria-labelledby={titleId} aria-describedby={textId}
    onCancel={(event) => { event.preventDefault(); if (!saving) setPending(null); }}>
    {pending ? <div className="unsaved-dialog-body">
      <h2 id={titleId}>{onSave ? "Deseja salvar as alterações antes de sair?" : "Sair sem enviar?"}</h2>
      <p id={textId}>{onSave
        ? "Você fez alterações nesta página que ainda não foram salvas."
        : "As informações preenchidas nesta página ainda não foram enviadas e serão perdidas."}</p>
      <div className="unsaved-dialog-actions">
        {onSave ? <button type="button" className="primary-button" onClick={() => void saveAndLeave()} disabled={saving}>{saving ? "Salvando…" : "Salvar e sair"}</button> : null}
        <button type="button" className="secondary-button" onClick={() => leave(pending)} disabled={saving}>{onSave ? "Sair sem salvar" : "Sair sem enviar"}</button>
        <button type="button" className="secondary-button" onClick={() => setPending(null)} disabled={saving}>{onSave ? "Cancelar" : "Continuar preenchendo"}</button>
      </div>
    </div> : null}
  </dialog>;

  return { dialog };
}

/** Compares a form state with the last saved one (plain JSON of the same shape). */
export function isDirty(current: unknown, saved: string | null) {
  return saved !== null && JSON.stringify(current) !== saved;
}
