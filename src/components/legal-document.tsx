import React from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { LEGAL_UPDATED_LABEL, LEGAL_VERSION } from "@/lib/legal/consent";

/** Contact shown in the legal texts: LEGAL_CONTACT_EMAIL when the team sets one, otherwise the school channels. */
export function LegalContact() {
  const email = process.env.LEGAL_CONTACT_EMAIL?.trim();
  return email
    ? <>pelo e-mail <a href={`mailto:${email}`}>{email}</a></>
    : <>pelos canais da equipe do projeto na instituição de ensino</>;
}

/** Shared layout of the Terms of Use and the Privacy Policy: plain reading page, versioned, with links between both. */
export default function LegalDocument({ title, children }: { title: string; children: React.ReactNode }) {
  return <main id="conteudo" className="legal-page" aria-labelledby="legal-title">
    <Link className="legal-brand" href="/" aria-label="Acessa Vagas — início"><BrandLogo /></Link>
    <article className="legal-document">
      <p className="eyebrow">Documento do AcessaVagas</p>
      <h1 id="legal-title">{title}</h1>
      <p className="legal-version">{`Versão ${LEGAL_VERSION}, atualizada em ${LEGAL_UPDATED_LABEL}. O AcessaVagas é um projeto acadêmico, sem fins comerciais.`}</p>
      {children}
      <nav className="legal-links" aria-label="Documentos">
        <Link href="/termos-de-uso">Termos de Uso</Link>
        <Link href="/privacidade">Política de Privacidade</Link>
        <Link href="/">Voltar ao início</Link>
      </nav>
    </article>
  </main>;
}
