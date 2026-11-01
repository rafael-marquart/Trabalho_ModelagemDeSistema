"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { infrastructureItems } from "@/lib/company-infrastructure/items";
import { jobModalityLabels, type JobModalityValue } from "@/lib/jobs/constants";
import { sortLabels, sortOptions, toSearchParams, type SearchQuery, type SortOption } from "@/lib/jobs/search";
import JobCard from "./job-card";
import type { SearchResult } from "./types";

type FilterKey = "cargo" | "area" | "modalidade" | "local" | "acessibilidade";
const filterTitles: Record<FilterKey, string> = { cargo: "Cargo", area: "Área profissional", modalidade: "Modalidade", local: "Localização", acessibilidade: "Acessibilidade declarada pela vaga" };
const emptyQuery: SearchQuery = { q: "", cargo: [], area: [], modalidade: [], local: [], acessibilidade: [], ordem: "compatibilidade", pagina: 1 };

/** SPEC-008 search: text, filters (AND between categories, OR inside one), order and numbered pages kept in the address. */
export default function JobSearch({ initialQuery }: { initialQuery: SearchQuery }) {
  const router = useRouter();
  const [query, setQuery] = useState<SearchQuery>(initialQuery);
  const [text, setText] = useState(initialQuery.q);
  const [data, setData] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const params = toSearchParams(query).toString();
    if (!firstLoad.current) router.replace(params ? `/candidato/vagas?${params}` : "/candidato/vagas", { scroll: false });
    let active = true;
    setLoading(true); setError("");
    fetch(`/api/candidato/vagas${params ? `?${params}` : ""}`).then(async response => {
      const body = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok) { setError(body.message || "Não foi possível carregar as vagas. Tente novamente."); setData(null); return; }
      setData(body as SearchResult);
      if (!firstLoad.current) resultsRef.current?.focus();
      firstLoad.current = false;
    }).catch(() => { if (active) setError("Não foi possível conectar ao serviço. Tente novamente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, router]);

  // Any change to the search or filters goes back to page 1 (OPEN-038).
  const update = (change: Partial<SearchQuery>) => setQuery(current => ({ ...current, ...change, pagina: change.pagina ?? 1 }));
  const toggle = (key: FilterKey, value: string, checked: boolean) => {
    const values = query[key] as string[];
    update({ [key]: checked ? [...values, value] : values.filter(item => item !== value) } as Partial<SearchQuery>);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); update({ q: text.trim() }); };
  const activeFilters = (["cargo", "area", "modalidade", "local", "acessibilidade"] as FilterKey[]).reduce((sum, key) => sum + (query[key] as string[]).length, 0);

  const options: Record<FilterKey, { value: string; label: string }[]> = {
    cargo: (data?.facets.cargo ?? []).map(value => ({ value, label: value })),
    area: (data?.facets.area ?? []).map(value => ({ value, label: value })),
    modalidade: (data?.facets.modalidade ?? []).map(value => ({ value, label: jobModalityLabels[value as JobModalityValue] ?? value })),
    local: (data?.facets.local ?? []).map(value => ({ value, label: value })),
    acessibilidade: infrastructureItems.map(item => ({ value: item.code, label: item.label }))
  };
  // Keep selected values visible even when no open job currently has them.
  for (const key of Object.keys(options) as FilterKey[]) {
    for (const value of query[key] as string[]) if (!options[key].some(option => option.value === value)) options[key].push({ value, label: value });
  }

  return <div className="job-search">
    <form className="job-search-bar" role="search" onSubmit={submit}>
      <label htmlFor="job-search-text" className="visually-hidden">Buscar vagas por cargo, descrição ou empresa</label>
      <input id="job-search-text" type="search" value={text} maxLength={200} onChange={event => setText(event.target.value)} placeholder="Buscar por cargo, descrição ou empresa" />
      <button type="submit" className="primary-button">Buscar</button>
    </form>

    <div className="job-search-layout">
      <aside className="job-filters" aria-label="Filtros">
        <div className="job-filters-head">
          <h2>Filtros{activeFilters ? ` (${activeFilters})` : ""}</h2>
          {activeFilters || query.q ? <button type="button" className="link-button" onClick={() => { setText(""); setQuery({ ...emptyQuery, ordem: query.ordem }); }}>Limpar busca e filtros</button> : null}
        </div>
        {(Object.keys(filterTitles) as FilterKey[]).map(key => options[key].length ? <fieldset key={key} className="job-filter-group">
          <legend>{filterTitles[key]}</legend>
          {options[key].map(option => <label key={option.value} className="job-filter-option">
            <input type="checkbox" checked={(query[key] as string[]).includes(option.value)} onChange={event => toggle(key, option.value, event.target.checked)} />
            <span>{option.label}</span>
          </label>)}
        </fieldset> : null)}
      </aside>

      <section className="job-results" aria-labelledby="job-results-title">
        <div className="job-results-head">
          <h2 id="job-results-title" ref={resultsRef} tabIndex={-1}>
            {loading ? "Carregando vagas…" : data ? `${data.total} ${data.total === 1 ? "vaga encontrada" : "vagas encontradas"}` : "Vagas"}
          </h2>
          <label className="job-sort">Ordenar por
            <select value={query.ordem} onChange={event => update({ ordem: event.target.value as SortOption })}>
              {sortOptions.map(option => <option key={option} value={option}>{sortLabels[option]}</option>)}
            </select>
          </label>
        </div>
        <p className="visually-hidden" role="status" aria-live="polite">{loading ? "Carregando vagas" : data ? `${data.total} vagas encontradas, página ${data.page} de ${data.pages}` : ""}</p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {data && data.hiddenIncompatible > 0 ? <p className="job-hidden-note muted">{data.hiddenIncompatible === 1 ? "1 vaga não aparece" : `${data.hiddenIncompatible} vagas não aparecem`} porque a vaga declara não ter um recurso que você marcou como indispensável.</p> : null}
        {data && data.jobs.length === 0 && !loading ? <div className="job-empty" role="status">
          <h3>Nenhuma vaga elegível encontrada</h3>
          <p className="muted">Tente outros termos, remova filtros ou revise seu perfil. Vagas incompatíveis com recursos indispensáveis não são exibidas.</p>
          {activeFilters || query.q ? <button type="button" className="secondary-button" onClick={() => { setText(""); setQuery({ ...emptyQuery, ordem: query.ordem }); }}>Limpar busca e filtros</button> : null}
        </div> : null}
        <div className="job-card-list" aria-busy={loading}>
          {data?.jobs.map(job => <JobCard key={job.id} job={job} />)}
        </div>
        {data && data.pages > 1 ? <nav className="job-pagination" aria-label="Páginas de resultados">
          <button type="button" className="secondary-button" disabled={data.page <= 1} onClick={() => update({ pagina: data.page - 1 })}>Anterior</button>
          <ol>{Array.from({ length: data.pages }, (_, index) => index + 1).map(page => <li key={page}>
            <button type="button" className={page === data.page ? "job-page job-page-current" : "job-page"} aria-current={page === data.page ? "page" : undefined}
              aria-label={`Página ${page}`} onClick={() => update({ pagina: page })}>{page}</button>
          </li>)}</ol>
          <button type="button" className="secondary-button" disabled={data.page >= data.pages} onClick={() => update({ pagina: data.page + 1 })}>Próxima</button>
        </nav> : null}
      </section>
    </div>
  </div>;
}
