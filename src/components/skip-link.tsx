"use client";

import React, { type MouseEvent } from "react";

/** First tab stop on every page: moves focus to the main content so keyboard users skip repeated navigation. */
export default function SkipLink() {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    const main = document.querySelector<HTMLElement>("main");
    if (!main) return;
    event.preventDefault();
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus();
    if (typeof main.scrollIntoView === "function") main.scrollIntoView({ block: "start" });
  }
  return <a className="skip-link" href="#conteudo" onClick={onClick}>Pular para o conteúdo principal</a>;
}
