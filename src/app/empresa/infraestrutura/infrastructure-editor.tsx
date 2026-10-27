"use client";

import React, { useEffect, useState } from "react";
import ChoiceGroup from "@/components/choice-group";
import { statusLabels, type InfrastructureStatus } from "@/lib/company-infrastructure/items";

type Category = { code: string; label: string };
type Item = { code: string; category: string; label: string; description: string; required: boolean };
type Answer = { status: InfrastructureStatus; note: string };

export default function InfrastructureEditor() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/company/infraestrutura").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Falha ao carregar.");
      if (!active) return;
      setCategories(data.catalog.categories); setItems(data.catalog.items);
      setAnswers(data.answers); setUpdatedAt(data.updatedAt);
    }).catch(() => { if (active) setError("Não foi possível carregar a infraestrutura. Atualize a página para tentar novamente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function update(code: string, change: Partial<Answer>) {
    setAnswers(current => ({ ...current, [code]: { ...current[code], ...change } }));
    if (change.status) setItemErrors(current => { const { [code]: _removed, ...rest } = current; return rest; });
  }

  async function save() {
    setError(""); setNotice("");
    const missing: Record<string, string> = {};
    for (const item of items) {
      const status = answers[item.code]?.status;
      if (item.required && status !== "PRESENT" && status !== "ABSENT") {
        missing[item.code] = `Informe se há ou não há: ${item.label.toLocaleLowerCase()}.`;
      }
    }
    if (Object.keys(missing).length) {
      setItemErrors(missing); setError("Responda os itens indicados antes de salvar."); return;
    }
    setItemErrors({}); setSaving(true);
    try {
      const response = await fetch("/api/company/infraestrutura", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers })
      });
      const result = await response.json();
      if (!response.ok) {
        const issues = (result.issues ?? {}) as Record<string, string>;
        setItemErrors(issues);
        setError(Object.keys(issues).length ? "Responda os itens indicados antes de salvar." : result.message || "Não foi possível salvar.");
        return;
      }
      setAnswers(result.answers); setUpdatedAt(result.updatedAt);
      setNotice("Infraestrutura salva. Você pode atualizar as informações quando algo mudar.");
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setSaving(false); }
  }

  const disabled = loading || saving;
  return <div className="candidate-profile-form" aria-busy={disabled}>
    {categories.map(category => <section className="profile-section" key={category.code}>
      <h2>{category.label}</h2>
      {items.filter(item => item.category === category.code).map(item => {
        const answer = answers[item.code] ?? { status: "NOT_INFORMED", note: "" };
        const options: InfrastructureStatus[] = item.required ? ["PRESENT", "ABSENT"] : ["PRESENT", "ABSENT", "NOT_INFORMED"];
        const errorId = `error-${item.code}`;
        return <div className="infrastructure-item" key={item.code}>
          <ChoiceGroup className="accessibility-declaration-choices" legend={`${item.label}${item.required ? " (obrigatório)" : ""}`}
            describedBy={`${item.code}-hint${itemErrors[item.code] ? ` ${errorId}` : ""}`} disabled={disabled}
            value={answer.status} onChange={status => update(item.code, { status })}
            choices={options.map(status => ({ value: status, label: statusLabels[status] }))}>
            <p className="muted" id={`${item.code}-hint`}>{item.description}</p>
          </ChoiceGroup>
          <label className="profile-section-title" htmlFor={`note-${item.code}`}>Observação sobre {item.label.toLocaleLowerCase()} (opcional)</label>
          <textarea id={`note-${item.code}`} rows={2} maxLength={300} value={answer.note}
            onChange={event => update(item.code, { note: event.target.value })} disabled={disabled}
            placeholder="Ex.: apenas no prédio principal" />
          {itemErrors[item.code] && <p className="form-error field-error" role="alert" id={errorId}>{itemErrors[item.code]}</p>}
        </div>;
      })}
    </section>)}
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success" role="status" aria-live="polite">{notice}</p>}
    <div className="profile-actions"><button className="primary-button" type="button" onClick={() => void save()} disabled={disabled}>
      {loading ? "Carregando..." : saving ? "Salvando..." : "Salvar infraestrutura"}</button></div>
    <p className="muted profile-footnote">{updatedAt ? `Última atualização: ${new Date(updatedAt).toLocaleString("pt-BR")}. ` : ""}Estas informações são declaradas pela empresa e não substituem os critérios específicos de cada vaga.</p>
  </div>;
}
