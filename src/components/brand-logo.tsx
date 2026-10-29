import React from "react";

/**
 * Acessa Vagas logo. On dark themes and on the purple welcome panel the light two-tone version (same drawing as the color PNG) is shown
 * (decision of 29/10/2026); CSS picks the visible image, so the choice follows the theme toggle without a reload.
 */
export default function BrandLogo({ onDark = false }: { onDark?: boolean }) {
  if (onDark) return <img className="brand-logo" src="/images/logo-acessa-vagas-claro.png" alt="Acessa Vagas" />;
  return <>
    <img className="brand-logo brand-logo-default" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" />
    <img className="brand-logo brand-logo-light" src="/images/logo-acessa-vagas-claro.png" alt="Acessa Vagas" />
  </>;
}
