"use client";

import { FormEvent, useEffect, useState } from "react";

type Group = "ARCHITECTURAL" | "COMMUNICATION" | "TECHNOLOGICAL";
type Option = { code: string; name: string; description: string; group: Group; isMandatory: boolean; isActive: boolean };
const groupLabels: Record<Group, string> = {
  ARCHITECTURAL: "Arquitetônicas", COMMUNICATION: "Comunicação", TECHNOLOGICAL: "Tecnológicas"
};
const emptyDraft = { code: "", name: "", description: "", group: "ARCHITECTURAL" as Group };
function groupLabel(group: Group) { return groupLabels[group]; }

export default function CatalogEditor() {
  const [options, setOptions] = useState<Option[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [savingCode, setSavingCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const response = await fetch("/api/admin/catalogo-acessibilidade");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Não foi possível carregar o catálogo.");
    setOptions(data.options);
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/catalogo-acessibilidade").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Não foi possível carregar o catálogo.");
      if (active) setOptions(data.options);
    }).catch(() => { if (active) setError("Não foi possível carregar o catálogo."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function createOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSavingCode("NEW");
    try {
      const response = await fetch("/api/admin/catalogo-acessibilidade", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft)
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Não foi possível cadastrar a opção."); return; }
      setDraft(emptyDraft); await load(); setNotice("Opção cadastrada e registrada na auditoria.");
    } catch { setError("Não foi possível conectar ao serviço do catálogo."); }
    finally { setSavingCode(""); }
  }

  async function saveOption(option: Option) {
    setError(""); setNotice(""); setSavingCode(option.code);
    try {
      const response = await fetch("/api/admin/catalogo-acessibilidade", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          code: option.code, name: option.name, description: option.description,
          group: option.group, isMandatory: option.isMandatory, isActive: option.isActive
        })
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Não foi possível atualizar a opção."); return; }
      await load(); setNotice(`Opção ${option.code} atualizada.`);
    } catch { setError("Não foi possível conectar ao serviço do catálogo."); }
    finally { setSavingCode(""); }
  }

  function updateOption(code: string, changes: Partial<Option>) {
    setOptions(current => current.map(option => option.code === code ? { ...option, ...changes } : option));
  }

  return <div className="catalog-admin-content">
    <header className="catalog-admin-header">
      <p className="eyebrow">Administração da plataforma</p>
      <h1>Catálogo de acessibilidade</h1>
      <p className="muted">Gerencie opções oficiais. Identificadores são estáveis: opções não são excluídas; desative-as para preservar declarações históricas.</p>
    </header>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success" role="status" aria-live="polite">{notice}</p>}
    <section className="profile-section">
      <h2>Adicionar opção oficial</h2>
      <p className="muted">A nova opção começa ativa e não obrigatória. Alterar a obrigatoriedade exige decisão de produto registrada.</p>
      <form className="catalog-admin-form" onSubmit={createOption}>
        <div className="catalog-admin-grid">
          <label>Identificador estável<input required pattern="[A-Z][A-Z0-9_-]{1,31}" value={draft.code} onChange={event => setDraft(current => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Ex.: A07" /></label>
          <label>Nome<input required value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} /></label>
          <label>Descrição<textarea required value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} /></label>
          <label>Grupo<select value={draft.group} onChange={event => setDraft(current => ({ ...current, group: event.target.value as Group }))}>
            <option value="ARCHITECTURAL">Arquitetônicas</option><option value="COMMUNICATION">Comunicação</option><option value="TECHNOLOGICAL">Tecnológicas</option>
          </select></label>
        </div>
        <div className="catalog-admin-actions"><span className="muted">Identificadores cadastrados não podem ser reutilizados.</span><button className="primary-button" type="submit" disabled={loading || savingCode !== ""}>{savingCode === "NEW" ? "Cadastrando..." : "Cadastrar opção"}</button></div>
      </form>
    </section>
    <h2 className="catalog-admin-section-title">Opções cadastradas ({options.length})</h2>
    {loading ? <p className="muted">Carregando catálogo...</p> : options.length === 0 ? <p className="muted">Nenhuma opção cadastrada.</p> :
      options.map(option => <section className="catalog-admin-card" key={option.code}>
        <div className="catalog-admin-row">
          <label>Código<input value={option.code} readOnly aria-label={`Identificador estável ${option.code}`} /></label>
          <label>Nome<input value={option.name} onChange={event => updateOption(option.code, { name: event.target.value })} /></label>
          <label>Descrição<textarea value={option.description} onChange={event => updateOption(option.code, { description: event.target.value })} /></label>
          <div>
            <label>Grupo<select value={option.group} onChange={event => updateOption(option.code, { group: event.target.value as Group })}>
              <option value="ARCHITECTURAL">Arquitetônicas</option><option value="COMMUNICATION">Comunicação</option><option value="TECHNOLOGICAL">Tecnológicas</option>
            </select></label>
            <div className="catalog-admin-flags">
              <label><input type="checkbox" checked={option.isMandatory} onChange={event => updateOption(option.code, { isMandatory: event.target.checked })} /> Obrigatória</label>
              <label><input type="checkbox" checked={option.isActive} onChange={event => updateOption(option.code, { isActive: event.target.checked })} /> Ativa</label>
            </div>
          </div>
        </div>
        <div className="catalog-admin-actions">
          <span className="muted">{groupLabel(option.group)} · {option.isActive ? "Ativa" : "Desativada"} · {option.isMandatory ? "Obrigatória" : "Não obrigatória"}</span>
          <button className="primary-button" type="button" disabled={savingCode !== ""} onClick={() => saveOption(option)}>{savingCode === option.code ? "Salvando..." : "Salvar alterações"}</button>
        </div>
      </section>)
    }
  </div>;
}
