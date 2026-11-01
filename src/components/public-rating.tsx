import React from "react";
import type { PublicRating as Rating, StarCounts } from "@/lib/public-rating/service";

const stars = [5, 4, 3, 2, 1] as const;
const count = (value: number) => `${value} ${value === 1 ? "avaliação" : "avaliações"}`;

function Distribution({ title, counts, total, id, level }: { title: string; counts: StarCounts; total: number; id: string; level: 3 | 4 }) {
  const Heading = level === 3 ? "h3" : "h4";
  return <div className="rating-criterion">
    <Heading id={id}>{title}</Heading>
    <ul className="rating-bars" aria-labelledby={id}>
      {stars.map((star) => <li key={star}>
        <span className="rating-label">{`${star} ${star === 1 ? "estrela" : "estrelas"}`}</span>
        <span className="rating-track" aria-hidden="true"><span className="rating-fill" style={{ width: `${total ? (counts[star] / total) * 100 : 0}%` }} /></span>
        <span className="rating-count">{count(counts[star])}</span>
      </li>)}
    </ul>
  </div>;
}

/**
 * SPEC-021: public accessibility note — how many valid evaluations gave each number of stars, per criterion. No average,
 * no names, no dates, no comments (RB-19, OPEN-082). Without evaluations it says there is not enough data (OPEN-084).
 */
export default function PublicRating({ rating, companyName, headingLevel = 3 }: { rating: Rating; companyName: string; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return <div className="public-rating">
    <Heading>Avaliações de candidatos</Heading>
    {rating.available ? <>
      <p className="muted">{`${count(rating.total)} de candidatos que fizeram entrevista com ${companyName}. Mostramos quantas avaliações deram cada número de estrelas, sem média, nomes ou comentários.`}</p>
      <Distribution id={`rating-acc-${headingLevel}`} title="Acessibilidade" counts={rating.accessibility} total={rating.total} level={headingLevel === 2 ? 3 : 4} />
      <Distribution id={`rating-inc-${headingLevel}`} title="Postura inclusiva" counts={rating.inclusion} total={rating.total} level={headingLevel === 2 ? 3 : 4} />
    </> : <p className="muted">{`Ainda não há dados suficientes: nenhum candidato avaliou o processo seletivo de ${companyName}. Isso não indica que a acessibilidade seja boa ou ruim.`}</p>}
  </div>;
}
