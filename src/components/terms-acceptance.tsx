"use client";

import React from "react";

/**
 * "Li e concordo" for signup and recruiter activation (OPEN-100). Never pre-checked; the documents open in a new tab so
 * the form being filled is not lost, and that is announced to screen readers.
 */
export default function TermsAcceptance({ checked, onChange, disabled }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="consent-check" htmlFor="acceptTerms">
    <input id="acceptTerms" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} required disabled={disabled} />
    <span>
      Li e concordo com os{" "}
      <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer">Termos de Uso<span className="visually-hidden"> (abre em nova aba)</span></a>
      {" "}e a{" "}
      <a href="/privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade<span className="visually-hidden"> (abre em nova aba)</span></a>.
    </span>
  </label>;
}
