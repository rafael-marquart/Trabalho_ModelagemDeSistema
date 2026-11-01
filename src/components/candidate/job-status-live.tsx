"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Availability } from "@/lib/jobs/detail";

const pill = { OPEN: "status-active", UNAVAILABLE: "status-pending", CLOSED: "status-neutral" } as const;
const CHECK_EVERY_MS = 60_000;

/**
 * SPEC-009: shows the job status and checks it again when the page regains focus and once a minute. If the company
 * changed it since the page was opened, the candidate is told in a live region and can refresh the page.
 */
export default function JobStatusLive({ jobId, initial }: { jobId: string; initial: Availability }) {
  const router = useRouter();
  const [current, setCurrent] = useState(initial);
  const [changed, setChanged] = useState(false);
  const shown = useRef(initial);

  const check = useCallback(async () => {
    try {
      const response = await fetch(`/api/candidato/vagas/${jobId}/status`, { cache: "no-store" });
      if (!response.ok) return;
      const { availability } = await response.json() as { availability: Availability };
      if (availability.code !== shown.current.code || availability.message !== shown.current.message) {
        shown.current = availability;
        setCurrent(availability);
        setChanged(true);
      }
    } catch {
      // A failed check keeps the status already shown; the operation that depends on it checks again on the server.
    }
  }, [jobId]);

  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") void check(); };
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void check(); }, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onVisible); };
  }, [check]);

  return <>
    <p className="job-detail-status">
      <span className={`status-pill ${pill[current.code]}`}>{`Vaga ${current.label.toLocaleLowerCase("pt-BR")}`}</span> <span>{current.message}</span>
    </p>
    <div role="status" aria-live="polite">
      {changed ? <div className="job-status-changed">
        <p>{`O status desta vaga mudou desde que você abriu a página: agora ela está ${current.label.toLocaleLowerCase("pt-BR")}.`}</p>
        <button type="button" className="secondary-button" onClick={() => { setChanged(false); router.refresh(); }}>Atualizar a página</button>
      </div> : null}
    </div>
  </>;
}
