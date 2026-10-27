"use client";

import { FormEvent, useEffect, useState } from "react";

type Declaration = "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
type Profile = {
  fullName: string; email: string; education: string[]; skills: string[]; languages: string[];
  professionalExperience: string[]; courses: string[]; certifications: string[]; professionalLinks: string[];
  accessibilityDeclaration: Declaration; accessibilityNeeds: string[]; essentialAccessibilityResources: string[];
  updatedAt?: string;
};
const empty: Profile = {
  fullName: "", email: "", education: [], skills: [], languages: [], professionalExperience: [],
  courses: [], certifications: [], professionalLinks: [], accessibilityDeclaration: "NOT_INFORMED",
  accessibilityNeeds: [], essentialAccessibilityResources: []
};
const sections: { key: keyof Profile; title: string; hint: string }[] = [
  { key: "education", title: "Formação e escolaridade", hint: "Uma formação por linha. Você pode completar esta seção depois." },
  { key: "skills", title: "Competências", hint: "Informe suas competências, uma por linha." },
  { key: "languages", title: "Idiomas", hint: "Informe idiomas e, se desejar, seu nível em cada linha." },
  { key: "professionalExperience", title: "Experiência profissional", hint: "Uma experiência por linha; inclua os detalhes relevantes." },
  { key: "courses", title: "Cursos", hint: "Um curso por linha." },
  { key: "certifications", title: "Certificações", hint: "Uma certificação por linha." },
  { key: "professionalLinks", title: "Links profissionais", hint: "Um link por linha. Use endereços completos, como https://..." },
  { key: "accessibilityNeeds", title: "Necessidades funcionais de acessibilidade", hint: "Autodeclaração opcional. Não informe laudos ou dados médicos." },
  { key: "essentialAccessibilityResources", title: "Recursos de acessibilidade indispensáveis", hint: "Informe recursos necessários, um por linha. Não há opções predefinidas nesta etapa." }
];
function asText(value: unknown) { return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string").join("\n") : ""; }
function lines(value: string) { return value.split("\n").map(x => x.trim()).filter(Boolean); }

export default function ProfileEditor({ accountName, accountEmail }: { accountName: string; accountEmail: string }) {
  const [profile, setProfile] = useState<Profile>({ ...empty, fullName: accountName, email: accountEmail });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/candidato/perfil").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Falha ao carregar.");
      if (active) setProfile({ ...empty, ...data.profile });
    }).catch(() => { if (active) setError("Não foi possível carregar o perfil. Atualize a página para tentar novamente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateList(key: keyof Profile, value: string) {
    setProfile(current => ({ ...current, [key]: lines(value) }));
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice(""); setSaving(true);
    const keys = ["education", "skills", "languages", "professionalExperience", "courses", "certifications",
      "professionalLinks", "accessibilityDeclaration", "accessibilityNeeds", "essentialAccessibilityResources"] as const;
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

  return <form className="candidate-profile-form" onSubmit={handleSubmit} aria-busy={loading || saving}>
    <section className="profile-section">
      <h2>Dados da conta</h2><p className="muted">Nome e e-mail vêm da sua conta e não precisam ser preenchidos novamente.</p>
      <div className="profile-account-grid"><div><span>Nome</span><strong>{profile.fullName || accountName}</strong></div><div><span>E-mail</span><strong>{profile.email || accountEmail}</strong></div></div>
    </section>
    {sections.map(section => <section className="profile-section" key={section.key}>
      <label className="profile-section-title" htmlFor={section.key}>{section.title}</label>
      <p className="muted">{section.hint}</p>
      {(section.key === "accessibilityNeeds" || section.key === "essentialAccessibilityResources") &&
        <p className="profile-privacy-note">Informações de acessibilidade são pessoais. Não é necessário anexar ou informar laudos médicos.</p>}
      <textarea id={section.key} value={asText(profile[section.key])} onChange={event => updateList(section.key, event.target.value)}
        rows={4} placeholder="Digite uma informação por linha" disabled={loading || saving} />
    </section>)}
    <section className="profile-section">
      <label className="profile-section-title" htmlFor="accessibilityDeclaration">Declaração de necessidades de acessibilidade</label>
      <p className="muted">Não informar não significa declarar que não possui necessidades.</p>
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
