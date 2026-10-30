"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import CompatibilityDetails, { scoreText } from "./compatibility-details";
import type { Compatibility } from "./types";

/** The score circle is a button; it opens an accessible dialog with A, T and D, the travel time and what is missing (SPEC-008/SPEC-010). */
export default function ScoreDialog({ jobTitle, result, jobId }: { jobTitle: string; result: Compatibility; jobId?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    }
  }, [open]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const complete = result.status === "COMPLETE" && result.score !== null;
  const travel = result.dimensions.D.components.find(component => component.label === "Deslocamento");
  const ring = complete ? { ["--score" as string]: `${result.score}` } as React.CSSProperties : undefined;

  return <>
    <button ref={triggerRef} type="button" className={`score-ring ${complete ? "score-ring-complete" : "score-ring-pending"}`} style={ring}
      onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label={`Compatibilidade: ${scoreText(result)}. Ver detalhes da vaga ${jobTitle}`}>
      <span className={`score-ring-value${complete && (result.score ?? 0) >= 100 ? " score-ring-value-long" : ""}`} aria-hidden="true">{complete ? `${result.score}%` : "?"}</span>
      <span className="score-ring-caption" aria-hidden="true">{complete ? "Match" : "Faltam dados"}</span>
    </button>
    <dialog ref={dialogRef} className="score-dialog" aria-labelledby={titleId} onClose={() => setOpen(false)} onCancel={() => setOpen(false)}>
      {open ? <div className="score-dialog-body">
        <header className="score-dialog-header">
          <div>
            <p className="eyebrow">Compatibilidade</p>
            <h2 id={titleId}>{jobTitle}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={close}>Fechar</button>
        </header>
        <CompatibilityDetails result={result} />
        {jobId ? <Link className="secondary-button score-profile-link" href={`/candidato/vagas/${jobId}`}>Ver detalhes da vaga</Link> : null}
      </div> : null}
    </dialog>
  </>;
}
