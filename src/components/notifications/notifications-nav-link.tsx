"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { UNREAD_EVENT } from "./events";

/** "Notificações" in the side menu with the unread count, refreshed every minute and when notices are read. */
export default function NotificationsNavLink({ href, current }: { href: string; current: boolean }) {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let alive = true;
    const refresh = () => fetch("/api/notificacoes/contagem", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { unread: 0 }))
      .then((body) => { if (alive) setUnread(Number(body.unread) || 0); })
      .catch(() => {});
    refresh();
    const timer = setInterval(refresh, 60_000);
    const onChange = (event: Event) => setUnread(Number((event as CustomEvent<number>).detail) || 0);
    window.addEventListener(UNREAD_EVENT, onChange);
    return () => { alive = false; clearInterval(timer); window.removeEventListener(UNREAD_EVENT, onChange); };
  }, []);
  return <Link className="company-nav-item" href={href} aria-current={current ? "page" : undefined}>
    Notificações
    {unread ? <span className="nav-badge"><span aria-hidden="true">{unread > 99 ? "99+" : unread}</span><span className="visually-hidden">{`, ${unread} não ${unread === 1 ? "lida" : "lidas"}`}</span></span> : null}
  </Link>;
}
