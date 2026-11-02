import React from "react";

/**
 * Shown on every page of the test environment (APP_ENV="staging", the deployment of desenvolvimento-do-projeto), so
 * nobody mistakes it for the real site: data there is fictitious and e-mails go to a test inbox, never to people.
 */
export default function StagingBanner({ appEnv = process.env.APP_ENV }: { appEnv?: string }) {
  if (appEnv !== "staging") return null;
  return <aside className="staging-banner" aria-label="Aviso do ambiente">
    <strong>Ambiente de testes.</strong> Dados fictícios; os e-mails vão para uma caixa de teste e não chegam a ninguém.
  </aside>;
}
