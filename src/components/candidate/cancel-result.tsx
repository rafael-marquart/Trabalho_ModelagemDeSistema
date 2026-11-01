"use client";

import React, { useEffect, useRef } from "react";

/** Result of a confirmed cancellation (SPEC-012): announced and focused; it never offers another cancel button. */
export default function CancelResult() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  return <div className="application-result" role="status">
    <h2 ref={headingRef} tabIndex={-1}>Candidatura cancelada</h2>
    <p>O cancelamento foi registrado. A candidatura continua aqui, com o histórico preservado.</p>
  </div>;
}
