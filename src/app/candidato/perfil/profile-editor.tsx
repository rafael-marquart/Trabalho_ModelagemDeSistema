"use client";

import { FormEvent, useEffect, useState } from "react";

type Declaration = "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
type NeedGroup = "ARCHITECTURAL" | "COMMUNICATION" | "TECHNOLOGICAL";
type NeedOption = {
  code: string; name: string; description: string; group: NeedGroup; isMandatory: boolean; isActive: boolean;
};
type Profile = {
  fullName: string; email: string; education: string[]; skills: string[]; languages: string[];
  professionalExperience: string[]; courses: string[]; certifications: string[]; professionalLinks: string[];
  accessibilityDeclaration: Declaration; accessibilityNeeds: string[]; accessibilityNeedOptionCodes: string[];
  essentialAccessibilityResources: string[]; updatedAt?: string;
};
const empty: Profile = {
  fullName: "", email: "", education: [], skills: [], languages: [], professionalExperience: [],
  courses: [], certifications: [], professionalLinks: [], accessibilityDeclaration: "NOT_INFORMED",
  accessibilityNeeds: [], accessibilityNeedOptionCodes: [], essentialAccessibilityResources: []
};
const sections: { key: keyof Profile; title: string; hint: string }[] = [
  { key: "education", title: "Formação e escolaridade", hint: "Uma formação por linha. Você pode completar esta seção depois." },
  { key: "skills", title: "Competências", hint: "Informe suas competências, uma por linha." },
  { key: "languages", title: "Idiomas", hint: "Informe idiomas e, se desejar, seu nível em cada linha." },
  { key: "professionalExperience", title: "Experiência profissional", hint: "Uma experiência por linha; inclua os detalhes relevantes." },
  { key: "courses", title: "Cursos", hint: "Um curso por linha." },
  { key: "certifications", title: "Certificações", hint: "Uma certificação por linha." },
  { key: "professionalLinks", title: "Links profissionais", hint: "Um link por linha. Use endereços completos, como https://..." },
  { key: "essentialAccessibilityResources", title: "Recursos de acessibilidade indispensáveis", hint: "Informe recursos que você precisa para realizar atividades profissionais, um por linha." }
];
const groupLabels: Record<NeedGroup, string> = {
  ARCHITECTURAL: "Necessidades arquitetônicas",
  COMMUNICATION: "Necessidades de comunicação",
  TECHNOLOGICAL: "Necessidades tecnológicas"
};
const groupOrder: NeedGroup[] = ["ARCHITECTURAL", "COMMUNICATION", "TECHNOLOGICAL"];
function asText(value: unknown) { return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string").join("\n") : ""; }
function lines(value: string) { return value.split("\n").map(x => x.trim()).filter(Boolean); }

export default function ProfileEditor({ accountName, accountEmail }: { accountName: string; accountEmail: string }) {
  const [profile, setProfile] = useState<Profile>({ ...empty, fullName: accountName, email: accountEmail });
  const [options, setOptions] = useState<NeedOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/candidato/perfil").then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Falha ao carregar perfil.");
        return data.profile;
      }),
      fetch("/api/candidato/catalogo-acessibilidade").then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Falha ao carregar catálogo.");
        return data.options as NeedOption[];
      })
    ]).then(([loadedProfile, loadedOptions]) => {
      if (!active) return;
      setProfile({ ...empty, ...loadedProfile });
      setOptions(loadedOptions);
    }).catch(() => {
      if (active) setError("Não foi possível carregar o perfil ou o catálogo de acessibilidade. Atualize a página para tentar novamente.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateList(key: keyof Profile, value: string) {
    const next = lines(value);
    setProfile(current => ({
      ...current,
      [key]: next,
      ...(key === "accessibilityNeeds" && next.length > 0 ? { accessibilityDeclaration: "NEEDS_DECLARED" as const } : {})
    }));
  }
  function toggleOption(code: string, checked: boolean) {
    setProfile(current => {
      const selected = new Set(current.accessibilityNeedOptionCodes);
      if (checked) selected.add(code); else selected.delete(code);
      return {
        ...current,
        accessibilityNeedOptionCodes: Array.from(selected),
        ...(checked ? { accessibilityDeclaration: "NEEDS_DECLARED" as const } : {})
      };
    });
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true);
    const keys = ["education", "skills", "languages", "professionalExperience", "courses", "certifications",
      "professionalLinks", "accessibilityDeclaration", "accessibilityNeeds", "accessibilityNeedOptionCodes",
      "essentialAccessibilityResources"] as const;
    const payload = Object.fromEntries(keys.map(key => [key, profile[key]]));
    try {
      const response = await fetch("/api/candidato/perfil", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) { setError(result.message || "Não foi possível salvar o perfil."); return; }
      setProfile(current => ({ ...current, ...result.profile, fullName: accountName, email: accountEmail }));
      setNotice("Perfil salvo. Você pode voltar e atualizar as informações quando quiser.");
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setSaving(false); }
  }

  const selectedCodes = new Set(profile.accessibilityNeedOptionCodes);
  return <form className="candidate-profile-form" onSubmit={handleSubmit} aria-busy={loading || saving}>
    <section className="profile-section">
      <h2>Dados da conta</h2><p className="muted">Nome e e-mail vêm da sua conta e não precisam ser preenchidos novamente.</p>
      <div className="profile-account-grid"><div><span>Nome</span><strong>{profile.fullName || accountName}</strong></div><div><span>E-mail</span><strong>{profile.email || accountEmail}</strong></div></div>
    </section>
    {sections.map(section => <section className="profile-section" key={section.key}>
      <label className="profile-section-title" htmlFor={section.key}>{section.title}</label>
      <p className="muted">{section.hint}</p>
      {section.key === "essentialAccessibilityResources" && <p className="profile-privacy-note">Não é necessário anexar ou informar laudos médicos.</p>}
      <textarea id={section.key} value={asText(profile[section.key])} onChange={event => updateList(section.key, event.target.value)}
        rows={4} placeholder="Digite uma informação por linha" disabled={loading || saving} />
    </section>)}
    <section className="profile-section">
      <h2>Necessidades funcionais de acessibilidade</h2>
      <p className="muted">A declaração é opcional. Se declarar necessidades, selecione ao menos uma opção do catálogo ou descreva uma necessidade não contemplada. Você pode fazer ambos.</p>
      <p className="profile-privacy-note">Estas informações são autodeclaradas. Não informe laudos nem dados médicos desnecessários.</p>
      {groupOrder.map(group => <fieldset className="accessibility-option-group" key={group}>
        <legend>{groupLabels[group]}</legend>
        {options.filter(option => option.group === group).map(option => {
          const checked = selectedCodes.has(option.code);
          return <label className={`accessibility-option${!option.isActive ? " accessibility-option-inactive" : ""}`} key={option.code}>
            <input type="checkbox" checked={checked} disabled={loading || saving || (!option.isActive && !checked)}
              onChange={event => toggleOption(option.code, event.target.checked)} />
            <span className="accessibility-option-copy">
              <strong>{option.name} <span className="accessibility-option-code">({option.code})</span></strong>
              <span>{option.description}</span>
              {!option.isActive && <span className="accessibility-option-status">Opção desativada; mantida apenas para preservar sua declaração anterior.</span>}
              {option.isMandatory && <span className="accessibility-option-status">Marcada como obrigatória pelo administrador.</span>}
            </span>
          </label>;
        })}
      </fieldset>)}
      <label className="profile-section-title" htmlFor="accessibilityNeedsOther">Necessidade não contemplada pelo catálogo</label>
      <p className="muted">Descrição livre. Ela não cria uma opção oficial automaticamente.</p>
      <textarea id="accessibilityNeedsOther" value={asText(profile.accessibilityNeeds)}
        onChange={event => updateList("accessibilityNeeds", event.target.value)} rows={3}
        placeholder="Descreva somente a adaptação ou recurso funcional necessário" disabled={loading || saving} />
      <label className="profile-section-title accessibility-declaration-label" htmlFor="accessibilityDeclaration">Situação da declaração</label>
      <select id="accessibilityDeclaration" value={profile.accessibilityDeclaration}
        onChange={event => setProfile(current => ({ ...current, accessibilityDeclaration: event.target.value as Declaration }))}
        disabled={loading || saving}>
        <option value="NOT_INFORMED">Não informado</option>
        <option value="NO_NEEDS_DECLARED">Declaro que não possuo necessidades de acessibilidade</option>
        <option value="NEEDS_DECLARED">Declaro necessidades de acessibilidade</option>
      </select>
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success" role="status" aria-live="polite">{notice}</p>}
    <div className="profile-actions"><button className="primary-button" type="submit" disabled={loading || saving}>{loading ? "Carregando perfil..." : saving ? "Salvando..." : "Salvar perfil"}</button></div>
    <p className="muted profile-footnote">O perfil pode ser preenchido progressivamente. A ausência de informação não será tratada como confirmação de compatibilidade com uma vaga.</p>
  </form>;
}
