"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  educationLevels, educationStatuses, languageLevels, type EducationEntry, type LanguageEntry
} from "@/lib/candidate-profile/options";

type Declaration = "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
type NeedGroup = "ARCHITECTURAL" | "COMMUNICATION" | "TECHNOLOGICAL";
type NeedOption = { code: string; name: string; description: string; group: NeedGroup; isMandatory: boolean; isActive: boolean };
type Profile = {
  fullName: string; email: string; education: EducationEntry[]; skills: string[]; languages: LanguageEntry[];
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
const textSections: { key: "skills" | "professionalExperience"; title: string; hint: string }[] = [
  { key: "skills", title: "Competências", hint: "Informe suas competências profissionais, uma por linha." },
  { key: "professionalExperience", title: "Experiências profissionais", hint: "Informe cada experiência em uma linha, por exemplo: cargo, empresa e período." }
];
type TextKey = "skills" | "professionalExperience" | "accessibilityNeeds";
function describeEducation(entry: EducationEntry) { return [entry.level, entry.course, entry.institution, entry.status].filter(Boolean).join(" · "); }
function describeLanguage(entry: LanguageEntry) { return [entry.language, entry.level].filter(Boolean).join(" · "); }
const groupLabels: Record<NeedGroup, string> = {
  ARCHITECTURAL: "Necessidades arquitetônicas",
  COMMUNICATION: "Necessidades de comunicação",
  TECHNOLOGICAL: "Necessidades tecnológicas"
};
const groupOrder: NeedGroup[] = ["ARCHITECTURAL", "COMMUNICATION", "TECHNOLOGICAL"];
const languageChoices = ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português", "Libras", "Outro"];
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
  const [languageLevel, setLanguageLevel] = useState<LanguageEntry["level"]>(languageLevels[1]);
  const [educationLevel, setEducationLevel] = useState<EducationEntry["level"]>(educationLevels[3]);
  const [educationCourse, setEducationCourse] = useState("");
  const [educationInstitution, setEducationInstitution] = useState("");
  const [educationStatus, setEducationStatus] = useState<EducationEntry["status"]>(educationStatuses[0]);
  const [linkUrl, setLinkUrl] = useState("");
  const [accessibilityResource, setAccessibilityResource] = useState("");
  const [courseName, setCourseName] = useState("");
  const [certificationName, setCertificationName] = useState("");
  const [documentCategory, setDocumentCategory] = useState<"COURSE" | "CERTIFICATION">("COURSE");
  const [documentName, setDocumentName] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  function updateList(key: TextKey, value: string) {
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
    const name = (language === "Outro" ? otherLanguage : language).trim();
    if (!name) { setError("Digite o nome do idioma."); return; }
    if (profile.languages.some(item => item.language.toLocaleLowerCase() === name.toLocaleLowerCase() && item.level === languageLevel)) {
      setError("Esse idioma e nível já foram adicionados."); return;
    }
    setProfile(current => ({ ...current, languages: [...current.languages, { language: name, level: languageLevel }] }));
    setOtherLanguage(""); setError("");
  }
  function removeLanguage(index: number) {
    setProfile(current => ({ ...current, languages: current.languages.filter((_, position) => position !== index) }));
  }
  function addEducation() {
    const course = educationCourse.trim();
    const institution = educationInstitution.trim();
    if (!course || !institution) { setError("Informe o curso ou área e a instituição para adicionar a formação."); return; }
    const entry: EducationEntry = { level: educationLevel, course, institution, status: educationStatus };
    if (profile.education.some(item => describeEducation(item).toLocaleLowerCase() === describeEducation(entry).toLocaleLowerCase())) {
      setError("Essa formação já foi adicionada."); return;
    }
    setProfile(current => ({ ...current, education: [...current.education, entry] }));
    setEducationCourse(""); setEducationInstitution(""); setError("");
  }
  function addNamedEntry(key: "courses" | "certifications", rawValue: string, reset: () => void, label: string) {
    const value = rawValue.trim();
    if (!value) { setError(`Informe o nome ${label} antes de adicionar.`); return; }
    if (profile[key].some(item => item.toLocaleLowerCase() === value.toLocaleLowerCase())) {
      setError(`Esse item já foi adicionado em ${key === "courses" ? "cursos" : "certificações"}.`); return;
    }
    setProfile(current => ({ ...current, [key]: [...current[key], value] }));
    reset(); setError("");
  }
  function removeNamedEntry(key: "courses" | "certifications", value: string) {
    setProfile(current => ({ ...current, [key]: current[key].filter(item => item !== value) }));
  }
  function addAccessibilityResource() {
    const value = accessibilityResource.trim();
    if (!value) { setError("Informe o recurso de acessibilidade antes de adicioná-lo."); return; }
    if (profile.essentialAccessibilityResources.some(item => item.toLocaleLowerCase() === value.toLocaleLowerCase())) {
      setError("Esse recurso de acessibilidade já foi adicionado."); return;
    }
    setProfile(current => ({ ...current, essentialAccessibilityResources: [...current.essentialAccessibilityResources, value] }));
    setAccessibilityResource(""); setError("");
  }
  function addProfessionalLink() {
    const value = linkUrl.trim();
    let parsed: URL;
    try { parsed = new URL(value); } catch { setError("Informe um endereço completo, incluindo https://."); return; }
    if (!["http:", "https:"].includes(parsed.protocol)) { setError("Use somente links http:// ou https://."); return; }
    if (profile.professionalLinks.includes(value)) { setError("Esse link já foi adicionado."); return; }
    setProfile(current => ({ ...current, professionalLinks: [...current.professionalLinks, value] }));
    setLinkUrl(""); setError("");
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
    try {
      const response = await fetch(`/api/candidato/documentos/${encodeURIComponent(document.id)}`, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setError(result.message || "Não foi possível remover o arquivo."); return; }
      setDocuments(current => current.filter(item => item.id !== document.id));
      setNotice("Arquivo removido.");
    } catch {
      setError("Não foi possível conectar ao serviço para remover o arquivo. Tente novamente.");
    }
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
    const hasSelections = profile.accessibilityNeedOptionCodes.length > 0 || profile.accessibilityNeeds.length > 0;
    if (value !== "NEEDS_DECLARED" && hasSelections &&
      !window.confirm("Ao mudar esta resposta, as opções e a descrição de necessidades já marcadas serão removidas ao salvar. Deseja continuar?")) {
      return;
    }
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
    <section className="profile-section">
      <h2>Formação e escolaridade</h2>
      <p className="muted">Adicione cada formação separadamente. Você pode registrar formações concluídas ou em andamento.</p>
      <div className="profile-education-controls">
        <label>Nível de escolaridade<select value={educationLevel} onChange={event => setEducationLevel(event.target.value as EducationEntry["level"])} disabled={loading || saving}>{educationLevels.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>Curso ou área<input value={educationCourse} onChange={event => setEducationCourse(event.target.value)} maxLength={160} placeholder="Ex.: Análise e Desenvolvimento de Sistemas" disabled={loading || saving} /></label>
        <label>Instituição de ensino<input value={educationInstitution} onChange={event => setEducationInstitution(event.target.value)} maxLength={160} placeholder="Ex.: Instituto Federal" disabled={loading || saving} /></label>
        <label>Situação<select value={educationStatus} onChange={event => setEducationStatus(event.target.value as EducationEntry["status"])} disabled={loading || saving}>{educationStatuses.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <button type="button" className="secondary-button" onClick={addEducation} disabled={loading || saving}>Adicionar formação</button>
      </div>
      <ul className="profile-chip-list">{profile.education.map((entry, index) => <li key={`${index}-${describeEducation(entry)}`}><span>{describeEducation(entry)}</span><button type="button" className="secondary-button" onClick={() => setProfile(current => ({ ...current, education: current.education.filter((_, position) => position !== index) }))} aria-label={`Remover formação: ${describeEducation(entry)}`}>Remover</button></li>)}</ul>
    </section>
    {textSections.map(section => <section className="profile-section" key={section.key}>
      <label className="profile-section-title" htmlFor={section.key}>{section.title}</label>
      <p className="muted">{section.hint}</p>
      <textarea id={section.key} value={asText(profile[section.key])} onChange={event => updateList(section.key, event.target.value)}
        rows={4} placeholder="Digite uma informação por linha" disabled={loading || saving} />
    </section>)}
    <section className="profile-section">
      <h2>Idiomas</h2>
      <p className="muted">Selecione um idioma, informe seu nível e adicione quantos idiomas precisar.</p>
      <div className="profile-language-controls">
        <label>Idioma<select value={language} onChange={event => setLanguage(event.target.value)} disabled={loading || saving}>
          {languageChoices.map(item => <option key={item} value={item}>{item}</option>)}
        </select></label>
        {language === "Outro" && <label>Outro idioma<input value={otherLanguage} onChange={event => setOtherLanguage(event.target.value)} maxLength={80} placeholder="Digite o idioma" /></label>}
        <label>Nível<select value={languageLevel} onChange={event => setLanguageLevel(event.target.value as LanguageEntry["level"])} disabled={loading || saving}>
          {languageLevels.map(item => <option key={item} value={item}>{item}</option>)}
        </select></label>
        <button type="button" className="secondary-button" onClick={addLanguage} disabled={loading || saving}>Adicionar idioma</button>
      </div>
      <ul className="profile-chip-list">{profile.languages.map((entry, index) => <li key={`${index}-${describeLanguage(entry)}`}><span>{describeLanguage(entry)}</span><button type="button" className="secondary-button" onClick={() => removeLanguage(index)} aria-label={`Remover idioma: ${describeLanguage(entry)}`}>Remover</button></li>)}</ul>
    </section>
    <section className="profile-section">
      <h2>Links profissionais</h2>
      <p className="muted">Cole o endereço completo do perfil profissional e adicione-o à lista. Use links públicos do seu portfólio profissional.</p>
      <div className="profile-link-controls">
        <label className="profile-link-url-label">Endereço do perfil profissional<input type="url" inputMode="url" autoComplete="url" value={linkUrl} onChange={event => setLinkUrl(event.target.value)} maxLength={2048} placeholder="https://www.linkedin.com/in/seu-perfil" disabled={loading || saving} /></label>
        <button type="button" className="secondary-button" onClick={addProfessionalLink} disabled={loading || saving}>Adicionar link</button>
      </div>
      <p className="muted">Exemplos: LinkedIn, GitHub, portfólio ou site pessoal. Cada endereço será validado e poderá ser removido individualmente.</p>
      <ul className="profile-document-list">{profile.professionalLinks.map((item, index) => <li key={item}><div><strong>Link profissional {index + 1}</strong><a href={item} target="_blank" rel="noreferrer">{item}</a></div><button type="button" className="secondary-button" onClick={() => setProfile(current => ({ ...current, professionalLinks: current.professionalLinks.filter((_,i) => i !== index) }))}>Remover</button></li>)}</ul>
    </section>
    <section className="profile-section">
      <h2>Cursos e certificações</h2>
      <p className="muted">Informe o nome de cada curso ou certificação. Anexar o comprovante é opcional.</p>
      <div className="profile-link-controls">
        <label className="profile-link-url-label">Nome do curso<input value={courseName} onChange={event => setCourseName(event.target.value)} maxLength={160} placeholder="Ex.: Excel avançado" disabled={loading || saving} /></label>
        <button type="button" className="secondary-button" onClick={() => addNamedEntry("courses", courseName, () => setCourseName(""), "do curso")} disabled={loading || saving}>Adicionar curso</button>
      </div>
      <ul className="profile-chip-list">{profile.courses.map(item => <li key={item}><span>{item}</span><button type="button" className="secondary-button" onClick={() => removeNamedEntry("courses", item)} aria-label={`Remover curso: ${item}`}>Remover</button></li>)}</ul>
      <div className="profile-link-controls">
        <label className="profile-link-url-label">Nome da certificação<input value={certificationName} onChange={event => setCertificationName(event.target.value)} maxLength={160} placeholder="Ex.: Certificação em gestão de projetos" disabled={loading || saving} /></label>
        <button type="button" className="secondary-button" onClick={() => addNamedEntry("certifications", certificationName, () => setCertificationName(""), "da certificação")} disabled={loading || saving}>Adicionar certificação</button>
      </div>
      <ul className="profile-chip-list">{profile.certifications.map(item => <li key={item}><span>{item}</span><button type="button" className="secondary-button" onClick={() => removeNamedEntry("certifications", item)} aria-label={`Remover certificação: ${item}`}>Remover</button></li>)}</ul>
      <h3 className="profile-subheading">Comprovantes (opcional)</h3>
      <p className="muted">Se quiser, anexe o comprovante. São aceitos PDF, DOC, DOCX, JPG e PNG, com até 10 MB por arquivo. Não envie laudos ou documentos médicos.</p>
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
        <div className="profile-document-actions"><a className="secondary-button" href={`/api/candidato/documentos/${encodeURIComponent(document.id)}`} aria-label={`Baixar arquivo: ${document.displayName}`}>Baixar</a><button className="secondary-button" type="button" onClick={() => void deleteDocument(document)} aria-label={`Remover arquivo: ${document.displayName}`}>Remover</button></div>
      </li>)}</ul>
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
    <section className="profile-section">
      <h2>Recursos de acessibilidade indispensáveis</h2>
      <p className="muted">Informe recursos funcionais necessários para realizar atividades profissionais. Adicione um por vez.</p>
      <p className="profile-privacy-note">Estas informações são autodeclaradas. Não é necessário anexar laudos médicos.</p>
      <div className="profile-link-controls">
        <label className="profile-link-url-label" htmlFor="accessibilityResourceInput">Recurso necessário
          <input id="accessibilityResourceInput" value={accessibilityResource} onChange={event => setAccessibilityResource(event.target.value)}
            maxLength={300} placeholder="Ex.: elevador, mesa adaptada, leitor de tela" disabled={loading || saving} />
        </label>
        <button type="button" className="secondary-button" onClick={addAccessibilityResource} disabled={loading || saving}>Adicionar recurso</button>
      </div>
      <ul className="profile-chip-list">{profile.essentialAccessibilityResources.map(item => <li key={item}>
        <span>{item}</span>
        <button type="button" className="secondary-button" onClick={() => setProfile(current => ({
          ...current, essentialAccessibilityResources: current.essentialAccessibilityResources.filter(value => value !== item)
        }))} disabled={loading || saving} aria-label={`Remover recurso: ${item}`}>Remover</button>
      </li>)}</ul>
    </section>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success" role="status" aria-live="polite">{notice}</p>}
    <div className="profile-actions"><button className="primary-button" type="button" onClick={() => void handleSubmit()} disabled={loading || saving || uploading}>{loading ? "Carregando perfil..." : saving ? "Salvando..." : "Salvar perfil"}</button></div>
    <p className="muted profile-footnote">O perfil pode ser preenchido progressivamente. A ausência de informação não será tratada como confirmação de compatibilidade com uma vaga.</p>
  </div>;
}
