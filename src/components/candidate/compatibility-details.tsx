import React from "react";
import Link from "next/link";
import type { Compatibility } from "./types";

const dimensionNames = { A: "Acessibilidade", T: "Perfil técnico", D: "Modalidade e deslocamento" } as const;
const baseWeights = { A: 50, T: 30, D: 20 } as const;
const itemNames: Record<string, string> = {
  RAMPS: "rampas de acesso", ELEVATORS: "elevadores", ADAPTED_RESTROOMS: "banheiros adaptados", SIGNAGE: "sinalização acessível", SCREEN_READERS: "leitores de tela"
};

type Missing = Compatibility["missing"][number];
type Responsible = "CANDIDATE" | "COMPANY" | "PLATFORM";

/** Who can supply a missing piece; results stored before this field existed are classified by their wording. */
export function responsibleOf(item: Missing): Responsible {
  if (item.responsible) return item.responsible;
  if (/empresa precisa|da vaga não informado/i.test(`${item.item} ${item.action}`)) return "COMPANY";
  if (/sem ação do candidato|serviço de rotas|tente novamente/i.test(`${item.item} ${item.action}`)) return "PLATFORM";
  return "CANDIDATE";
}

const missingGroups: { key: Responsible; title: string; note: string }[] = [
  { key: "CANDIDATE", title: "Falta no seu perfil", note: "Complete estas informações para calcular o score." },
  { key: "COMPANY", title: "A empresa não informou", note: "Não depende de você: a empresa precisa completar a vaga." },
  { key: "PLATFORM", title: "Não foi possível calcular agora", note: "Não depende de você nem da empresa." }
];

export function scoreText(result: Compatibility) {
  if (result.status === "COMPLETE" && result.score !== null) return `${result.score}%`;
  return result.status === "INCOMPATIBLE" ? "Incompatível" : "Dados insuficientes";
}

/**
 * SPEC-010 (OPEN-044/046): the SPEC-007 result as calculated — never recomputed here. A complete score, a critical
 * incompatibility and missing data are told apart in words, not only by color.
 */
export default function CompatibilityDetails({ result, headingLevel = 3 }: { result: Compatibility; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const complete = result.status === "COMPLETE" && result.score !== null;
  const travel = result.dimensions.D.components.find(component => component.label === "Deslocamento");
  const pending = result.critical?.pending ?? [];
  const barriers = result.critical?.barriers ?? [];
  return <div className="compat-details">
    <p className="score-dialog-total"><strong>{scoreText(result)}</strong>
      {complete ? " de compatibilidade com o seu perfil."
        : result.status === "INSUFFICIENT_DATA" ? " — faltam informações para calcular o score; nenhum valor foi presumido."
          : " — a vaga não é elegível para você."}</p>
    {barriers.length ? <p className="compat-alert" role="note">A vaga declara não ter {barriers.map(barrier => itemNames[barrier.jobItem] ?? barrier.jobItem).join(", ")}, que você marcou como indispensável ({barriers.map(barrier => barrier.needName).join(", ")}). Por isso ela não aparece como elegível, independentemente do score.</p> : null}
    {pending.length ? <p className="compat-alert" role="note">Elegibilidade não concluída: a vaga não informou {pending.map(item => itemNames[item.jobItem] ?? item.jobItem).join(", ")}, que você marcou como indispensável.</p> : null}
    <ul className="score-dimensions">
      {(["A", "T", "D"] as const).map(code => {
        const dimension = result.dimensions[code];
        const weight = result.appliedWeights?.[code];
        const value = dimension.status === "EVALUATED" ? `${Math.round(dimension.score ?? 0)}/100` : dimension.status === "NOT_APPLICABLE" ? "Não se aplica" : "Dados insuficientes";
        return <li key={code} className="score-dimension">
          <div className="score-dimension-head"><strong>{dimensionNames[code]}</strong><span>{value}</span></div>
          {dimension.status === "EVALUATED" ? <div className="score-bar" aria-hidden="true"><span style={{ width: `${Math.round(dimension.score ?? 0)}%` }} /></div> : null}
          <p className="muted">Peso {weight !== undefined ? `${Math.round(weight * 100)}%` : `${baseWeights[code]}%`} no score final.</p>
          {dimension.components.length ? <details className="score-dimension-more">
            <summary>Ver critérios de {dimensionNames[code].toLocaleLowerCase("pt-BR")}</summary>
            <ul>{dimension.components.map((component, index) => <li key={index}>{component.label}: {component.detail}</li>)}</ul>
          </details> : null}
        </li>;
      })}
    </ul>
    <section className="score-travel" aria-label="Deslocamento">
      <H>Tempo até o trabalho</H>
      <p>{travel ? travel.detail : result.dimensions.D.status === "INSUFFICIENT" ? "Não foi possível estimar o tempo de deslocamento." : "Vaga remota ou sem deslocamento a calcular."}</p>
    </section>
    {missingGroups.map(group => {
      const items = result.missing.filter(item => responsibleOf(item) === group.key);
      if (!items.length) return null;
      return <section key={group.key} className={`missing-group missing-${group.key.toLowerCase()}`} aria-label={group.title}>
        <H>{group.title}</H>
        <p className="muted">{group.note}</p>
        <ul>{items.map((item, index) => <li key={index}><strong>{item.item.replace(/\.+$/, "")}.</strong> {item.action}</li>)}</ul>
        {group.key === "CANDIDATE" ? <Link className="secondary-button score-profile-link" href="/candidato/perfil">Completar meu perfil</Link> : null}
      </section>;
    })}
  </div>;
}
