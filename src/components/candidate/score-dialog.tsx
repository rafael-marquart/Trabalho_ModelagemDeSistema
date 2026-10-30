"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { Compatibility } from "./types";

const dimensionNames = { A: "Acessibilidade", T: "Perfil técnico", D: "Modalidade e deslocamento" } as const;
const baseWeights = { A: 50, T: 30, D: 20 } as const;

function scoreText(result: Compatibility) {
  if (result.status === "COMPLETE" && result.score !== null) return `${result.score}%`;
  return result.status === "INCOMPATIBLE" ? "Incompatível" : "Dados insuficientes";
}

/** The score circle is a button; it opens an accessible dialog with A, T and D, the travel time and what is missing (SPEC-008/SPEC-010). */
export default function ScoreDialog({ jobTitle, result }: { jobTitle: string; result: Compatibility }) {
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
        <p className="score-dialog-total"><strong>{scoreText(result)}</strong>
          {complete ? " de compatibilidade com o seu perfil." : result.status === "INSUFFICIENT_DATA" ? " — faltam informações para calcular o score; nenhum valor foi presumido." : ""}</p>
        <ul className="score-dimensions">
          {(["A", "T", "D"] as const).map(code => {
            const dimension = result.dimensions[code];
            const weight = result.appliedWeights?.[code];
            const value = dimension.status === "EVALUATED" ? `${Math.round(dimension.score ?? 0)}/100` : dimension.status === "NOT_APPLICABLE" ? "Não se aplica" : "Dados insuficientes";
            return <li key={code} className="score-dimension">
              <div className="score-dimension-head"><strong>{dimensionNames[code]}</strong><span>{value}</span></div>
              {dimension.status === "EVALUATED" ? <div className="score-bar" aria-hidden="true"><span style={{ width: `${Math.round(dimension.score ?? 0)}%` }} /></div> : null}
              <p className="muted">Peso {weight !== undefined ? `${Math.round(weight * 100)}%` : `${baseWeights[code]}%`} no score final.</p>
              {dimension.components.length ? <ul>{dimension.components.map((component, index) => <li key={index}>{component.label}: {component.detail}</li>)}</ul> : null}
            </li>;
          })}
        </ul>
        <section className="score-travel" aria-label="Deslocamento">
          <h3>Tempo até o trabalho</h3>
          <p>{travel ? travel.detail : result.dimensions.D.status === "INSUFFICIENT" ? "Não foi possível estimar o tempo de deslocamento." : "Vaga remota ou sem deslocamento a calcular."}</p>
        </section>
        {result.missing.length ? <section aria-label="O que falta">
          <h3>O que falta</h3>
          <ul>{result.missing.map((item, index) => <li key={index}><strong>{item.item.replace(/\.+$/, "")}.</strong> {item.action}</li>)}</ul>
          <Link className="secondary-button score-profile-link" href="/candidato/perfil">Completar meu perfil</Link>
        </section> : null}
      </div> : null}
    </dialog>
  </>;
}
