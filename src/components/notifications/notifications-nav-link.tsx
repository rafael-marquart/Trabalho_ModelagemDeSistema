"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UNREAD_EVENT } from "./events";

/** "Notificações" in the side menu with the unread count, refreshed every minute while the tab is visible and when notices are read. */
// The last count survives page changes inside the site, so moving between pages does not ask the server again.
const FRESH_MS = 30_000;
let lastCount: { unread: number; at: number } | null = null;

export default function NotificationsNavLink({ href, current }: { href: string; current: boolean }) {
  const [unread, setUnread] = useState(lastCount?.unread ?? 0);
  useEffect(() => {
    let alive = true;
    const refresh = () => fetch("/api/notificacoes/contagem", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { unread: 0 }))
      .then((body) => { const value = Number(body.unread) || 0; lastCount = { unread: value, at: Date.now() }; if (alive) setUnread(value); })
      .catch(() => {});
    // Only a visible tab asks the server (once a minute); coming back to the tab refreshes at once.
    const visible = () => typeof document === "undefined" || document.visibilityState !== "hidden";
    if (!lastCount || Date.now() - lastCount.at > FRESH_MS) refresh();
    const timer = setInterval(() => { if (visible()) refresh(); }, 60_000);
    const onVisible = () => { if (visible()) refresh(); };
    const onChange = (event: Event) => { const value = Number((event as CustomEvent<number>).detail) || 0; lastCount = { unread: value, at: Date.now() }; setUnread(value); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener(UNREAD_EVENT, onChange);
    return () => { alive = false; clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener(UNREAD_EVENT, onChange); };
  }, []);
  return <Link className="company-nav-item" href={href} aria-current={current ? "page" : undefined}>
    Notificações
    {unread ? <span className="nav-badge"><span aria-hidden="true">{unread > 99 ? "99+" : unread}</span><span className="visually-hidden">{`, ${unread} não ${unread === 1 ? "lida" : "lidas"}`}</span></span> : null}
  </Link>;
}
