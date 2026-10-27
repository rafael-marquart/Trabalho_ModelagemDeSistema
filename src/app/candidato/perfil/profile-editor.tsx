"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

type Declaration = "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
type NeedGroup = "ARCHITECTURAL" | "COMMUNICATION" | "TECHNOLOGICAL";
type NeedOption = { code: string; name: string; description: string; group: NeedGroup; isMandatory: boolean; isActive: boolean };
type Profile = {
  fullName: string; email: string; education: string[]; skills: string[]; languages: string[];
  professionalExperience: string[]; courses: string[]; certifications: string[]; professionalLinks: string[];
  accessibilityDeclaration: Declaration; accessibilityNeeds: string[]; accessibilityNeedOptionCodes: string[];
  essentialAccessibilityResources: string[]; updatedAt?: string;
};
type ProfileDocument = { id: string; category: "COURSE" | "CERTIFICATION"; displayName: string; originalName: string; mimeType: string; sizeBytes: number; createdAt: string };
const empty: Profile = {
  fullName: "", email: "", education: [], skills: [], languages: [], professionalExperience: [],
  courses: [], certifications: [], professionalLinks: [], accessibilityDeclaration: "NOT_INFORMED",
  accessibilityNeeds: [], accessibilityNeedOptionCodes: [], essentialAccessibilityResources: []
};
const sections: { key: keyof Profile; title: string; hint: string }[] = [
  { key: "education", title: "Formação e escolaridade", hint: "Uma formação por linha. Você pode completar esta seção depois." },
  { key: "skills", title: "Competências", hint: "Informe suas competências, uma por linha." },
  { key: "professionalExperience", title: "Experiência profissional", hint: "Uma experiência por linha; inclua os detalhes relevantes." },
  { key: "professionalLinks", title: "Links profissionais", hint: "Um link por linha. Use endereços completos, como https://..." },
  { key: "essentialAccessibilityResources", title: "Recursos de acessibilidade indispensáveis", hint: "Informe recursos funcionais necessários para realizar atividades profissionais, um por linha." }
];
const groupLabels: Record<NeedGroup, string> = {
  ARCHITECTURAL: "Necessidades arquitetônicas",
  COMMUNICATION: "Necessidades de comunicação",
  TECHNOLOGICAL: "Necessidades tecnológicas"
};
const groupOrder: NeedGroup[] = ["ARCHITECTURAL", "COMMUNICATION", "TECHNOLOGICAL"];
const languageChoices = ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português", "Libras", "Outro"];
const languageLevels = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];
const acceptedFiles = ".pdf,.doc,.docx,.jpg,.jpeg,.png";
function asText(value: unknown) { return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string").join("\n") : ""; }
function lines(value: string) { return value.split("\n").map(x => x.trim()).filter(Boolean); }
function formatBytes(value: number) { return value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`; }

export default function ProfileEditor({ accountName, accountEmail }: { accountName: string; accountEmail: string }) {
  const [profile, setProfile] = useState<Profile>({ ...empty, fullName: accountName, email: accountEmail });
  const [options, setOptions] = useState<NeedOption[]>([]);
  const [documents, setDocuments] = useState<ProfileDocument[]>([]);
  const [language, setLanguage] = useState(languageChoices[0]);
  const [otherLanguage, setOtherLanguage] = useState("");
  const [languageLevel, setLanguageLevel] = useState(languageLevels[1]);
  const [documentCategory, setDocumentCategory] = useState<"COURSE" | "CERTIFICATION">("COURSE");
  const [documentName, setDocumentName] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDocuments() {
    const response = await fetch("/api/candidato/documentos");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Falha ao carregar arquivos.");
    setDocuments(data.documents as ProfileDocument[]);
  }

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
      }),
      fetch("/api/candidato/documentos").then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Falha ao carregar arquivos.");
        return data.documents as ProfileDocument[];
      })
    ]).then(([loadedProfile, loadedOptions, loadedDocuments]) => {
      if (!active) return;
      setProfile({ ...empty, ...loadedProfile });
      setOptions(loadedOptions);
      setDocuments(loadedDocuments);
    }).catch(() => {
      if (active) setError("Não foi possível carregar o perfil, o catálogo ou os arquivos. Atualize a página para tentar novamente.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function updateList(key: keyof Profile, value: string) {
    setProfile(current => ({ ...current, [key]: lines(value) }));
  }
  function toggleOption(code: string, checked: boolean) {
    setProfile(current => {
      const selected = new Set(current.accessibilityNeedOptionCodes);
      if (checked) selected.add(code); else selected.delete(code);
      return { ...current, accessibilityNeedOptionCodes: Array.from(selected) };
    });
  }
  function addLanguage() {
    const name = language === "Outro" ? otherLanguage.trim() : language;
    if (!name) { setError("Digite o nome do idioma."); return; }
    const entry = `${name} — ${languageLevel}`;
    if (profile.languages.some(item => item.toLocaleLowerCase() === entry.toLocaleLowerCase())) {
      setError("Esse idioma e nível já foram adicionados."); return;
    }
    setProfile(current => ({ ...current, languages: [...current.languages, entry] }));
    setOtherLanguage(""); setError("");
  }
  function removeLanguage(entry: string) {
    setProfile(current => ({ ...current, languages: current.languages.filter(item => item !== entry) }));
  }
  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    if (!documentName.trim() || !documentFile) { setError("Informe o nome e selecione um arquivo."); return; }
    const data = new FormData();
    data.set("category", documentCategory); data.set("displayName", documentName.trim()); data.set("file", documentFile);
    setUploading(true);
    try {
      const response = await fetch("/api/candidato/documentos", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) { setError(result.message || "Não foi possível enviar o arquivo."); return; }
      setDocuments(current => [result.document as ProfileDocument, ...current]);
      setDocumentName(""); setDocumentFile(null);
      const input = document.getElementById("profileDocumentFile") as HTMLInputElement | null;
      if (input) input.value = "";
      setNotice("Arquivo enviado com segurança para o armazenamento privado local.");
    } catch { setError("Não foi possível enviar o arquivo. Tente novamente."); }
    finally { setUploading(false); }
  }
  async function deleteDocument(document: ProfileDocument) {
    setError(""); setNotice("");
    const response = await fetch(`/api/candidato/documentos/${encodeURIComponent(document.id)}`, { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setError(result.message || "Não foi possível remover o arquivo."); return; }
    setDocuments(current => current.filter(item => item.id !== document.id));
    setNotice("Arquivo removido.");
  }
  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault(); setError(""); setNotice(""); setSaving(true);
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
  const selectedDeclaration = (value: Declaration) => {
    setProfile(current => ({
      ...current, accessibilityDeclaration: value,
      ...(value !== "NEEDS_DECLARED" ? { accessibilityNeeds: [], accessibilityNeedOptionCodes: [] } : {})
    }));
  };
  return <div className="candidate-profile-form" aria-busy={loading || saving || uploading}>
    <section className="profile-section">
      <h2>Dados da conta</h2><p className="muted">Nome e e-mail vêm da sua conta e não precisam ser preenchidos novamente.</p>
      <div className="profile-account-grid"><div><span>Nome</span><strong>{profile.fullName || accountName}</strong></div><div><span>E-mail</span><strong>{profile.email || accountEmail}</strong></div></div>
    </section>
    {sections.map(section => <section className="profile-section" key={section.key}>
      <label className="profile-section-title" htmlFor={section.key}>{section.title}</label>
      <p className="muted">{section.hint}</p>
      {section.key === "essentialAccessibilityResources" && <p className="profile-privacy-note">Estas informações são autodeclaradas. Não é necessário anexar laudos médicos.</p>}
      <textarea id={section.key} value={asText(profile[section.key])} onChange={event => updateList(section.key, event.target.value)}
        rows={4} placeholder="Digite uma informação por linha" disabled={loading || saving} />
    </section>)}
    <section className="profile-section">
      <label className="profile-section-title" htmlFor="profileLanguages">Idiomas</label>
      <p className="muted">Selecione um idioma, informe seu nível e adicione quantos idiomas precisar.</p>
      <div className="profile-language-controls">
        <label>Idioma<select value={language} onChange={event => setLanguage(event.target.value)} disabled={loading || saving}>
          {languageChoices.map(item => <option key={item} value={item}>{item}</option>)}
        </select></label>
        {language === "Outro" && <label>Outro idioma<input value={otherLanguage} onChange={event => setOtherLanguage(event.target.value)} maxLength={80} placeholder="Digite o idioma" /></label>}
        <label>Nível<select value={languageLevel} onChange={event => setLanguageLevel(event.target.value)} disabled={loading || saving}>
          {languageLevels.map(item => <option key={item} value={item}>{item}</option>)}
        </select></label>
        <button type="button" className="secondary-button" onClick={addLanguage} disabled={loading || saving}>Adicionar idioma</button>
      </div>
      <ul className="profile-chip-list">{profile.languages.map(item => <li key={item}><span>{item}</span><button type="button" className="secondary-button" onClick={() => removeLanguage(item)} aria-label={`Remover ${item}`}>Remover</button></li>)}</ul>
    </section>
    <section className="profile-section">
      <h2>Cursos e certificações</h2>
      <p className="muted">Adicione o nome e o arquivo correspondente. São aceitos PDF, DOC, DOCX, JPG e PNG, com até 10 MB por arquivo.</p>
      <form className="profile-document-form" onSubmit={uploadDocument}>
        <label>Tipo<select value={documentCategory} onChange={event => setDocumentCategory(event.target.value as "COURSE" | "CERTIFICATION")} disabled={uploading}>
          <option value="COURSE">Curso</option><option value="CERTIFICATION">Certificação</option>
        </select></label>
        <label>Nome do curso ou certificação<input value={documentName} onChange={event => setDocumentName(event.target.value)} maxLength={160} placeholder="Ex.: Excel avançado" disabled={uploading} /></label>
        <label>Arquivo<input id="profileDocumentFile" type="file" accept={acceptedFiles} onChange={(event: ChangeEvent<HTMLInputElement>) => setDocumentFile(event.target.files?.[0] ?? null)} disabled={uploading} /></label>
        <button className="primary-button" type="submit" disabled={uploading || loading}>{uploading ? "Enviando arquivo..." : "Adicionar arquivo"}</button>
      </form>
      <p className="profile-privacy-note">Os arquivos ficam em armazenamento privado local, fora da pasta pública. Somente a conta proprietária pode baixá-los ou removê-los.</p>
      <ul className="profile-document-list">{documents.map(document => <li key={document.id}>
        <div><strong>{document.displayName}</strong><span>{document.category === "COURSE" ? "Curso" : "Certificação"} · {document.originalName} · {formatBytes(document.sizeBytes)}</span></div>
        <div className="profile-document-actions"><a className="secondary-button" href={`/api/candidato/documentos/${encodeURIComponent(document.id)}`}>Baixar</a><button className="secondary-button" type="button" onClick={() => void deleteDocument(document)}>Remover</button></div>
      </li>)}</ul>
      <p className="muted">Os nomes dos cursos e certificações antigos continuam no perfil para preservar dados já registrados.</p>
      <label className="profile-section-title" htmlFor="courses">Cursos (texto, opcional)</label>
      <textarea id="courses" value={asText(profile.courses)} onChange={event => updateList("courses", event.target.value)} rows={2} placeholder="Um curso por linha" />
      <label className="profile-section-title" htmlFor="certifications">Certificações (texto, opcional)</label>
      <textarea id="certifications" value={asText(profile.certifications)} onChange={event => updateList("certifications", event.target.value)} rows={2} placeholder="Uma certificação por linha" />
    </section>
    <section className="profile-section">
      <h2>Necessidades funcionais de acessibilidade</h2>
      <p className="muted">Escolha uma opção antes de preencher os detalhes. A declaração é opcional.</p>
      <fieldset className="accessibility-declaration-choices">
        <legend>Você precisa de adaptações de acessibilidade?</legend>
        <label><input type="radio" name="accessibilityDeclaration" checked={profile.accessibilityDeclaration === "NO_NEEDS_DECLARED"} onChange={() => selectedDeclaration("NO_NEEDS_DECLARED")} disabled={loading || saving} /> Não preciso de adaptações de acessibilidade</label>
        <label><input type="radio" name="accessibilityDeclaration" checked={profile.accessibilityDeclaration === "NEEDS_DECLARED"} onChange={() => selectedDeclaration("NEEDS_DECLARED")} disabled={loading || saving} /> Preciso de adaptações de acessibilidade</label>
        <label><input type="radio" name="accessibilityDeclaration" checked={profile.accessibilityDeclaration === "NOT_INFORMED"} onChange={() => selectedDeclaration("NOT_INFORMED")} disabled={loading || saving} /> Prefiro não informar</label>
      </fieldset>
      {profile.accessibilityDeclaration === "NEEDS_DECLARED" && <>
        <p className="profile-privacy-note">Estas informações são autodeclaradas. Não informe laudos nem dados médicos desnecessários. Selecione ao menos uma opção ou descreva uma necessidade não contemplada; você pode fazer ambos.</p>
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
      </>}
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success" role="status" aria-live="polite">{notice}</p>}
    <div className="profile-actions"><button className="primary-button" type="button" onClick={() => void handleSubmit()} disabled={loading || saving || uploading}>{loading ? "Carregando perfil..." : saving ? "Salvando..." : "Salvar perfil"}</button></div>
    <p className="muted profile-footnote">O perfil pode ser preenchido progressivamente. A ausência de informação não será tratada como confirmação de compatibilidade com uma vaga.</p>
  </div>;
}
