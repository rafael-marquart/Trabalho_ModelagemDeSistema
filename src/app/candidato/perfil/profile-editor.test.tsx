import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProfileEditor from "./profile-editor";

const emptyProfile = {
  education: [], languages: [], professionalExperience: [], courses: [], certifications: [],
  professionalLinks: [], workPreferences: { modalities: [], city: "", state: "", address: "", transportMode: "" }, accessibilityDeclaration: "NOT_INFORMED", accessibilityNeeds: [],
  accessibilityNeedOptionCodes: [], essentialAccessibilityResources: []
};

function stubFetch() {
  const fetchMock = vi.fn(async (url: string) => ({
    ok: true,
    json: async () => url.includes("catalogo") ? { options: [] }
      : url.includes("documentos") ? { documents: [] }
      : { profile: { fullName: "Maria", email: "maria@example.com", ...emptyProfile } }
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function renderEditor() {
  const fetchMock = stubFetch();
  render(<ProfileEditor accountName="Maria" accountEmail="maria@example.com" />);
  await waitFor(() => expect((screen.getByRole("button", { name: "Salvar perfil" }) as HTMLButtonElement).disabled).toBe(false));
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("candidate profile editor", () => {
  it("offers every approved professional category, including experiences", async () => {
    await renderEditor();
    for (const title of ["Formação e escolaridade", "Idiomas", "Links profissionais", "Cursos e certificações",
      "Necessidades funcionais de acessibilidade", "Recursos de acessibilidade indispensáveis"]) {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    }
    expect(screen.getByRole("heading", { name: "Experiências profissionais" })).toBeTruthy();
    expect(screen.queryByLabelText("Competências")).toBeNull();
  });

  it("never points a label at a control that does not exist", async () => {
    await renderEditor();
    const orphans = Array.from(document.querySelectorAll("label[for]"))
      .map((label) => label.getAttribute("for"))
      .filter((id) => !id || !document.getElementById(id));
    expect(orphans).toEqual([]);
  });

  it("registers a course by name without requiring an attachment", async () => {
    const fetchMock = await renderEditor();
    fireEvent.change(screen.getByLabelText("Nome do curso"), { target: { value: "Excel avançado" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar curso" }));
    expect(screen.getByText("Excel avançado")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remover curso: Excel avançado" })).toBeTruthy();
    const methods = fetchMock.mock.calls.map((call) => (call as unknown as [string, RequestInit?])[1]?.method);
    expect(methods.filter((method) => method === "POST")).toHaveLength(0);
  });

  it("sends education and languages as structured objects when saving", async () => {
    const fetchMock = await renderEditor();
    fireEvent.change(screen.getByLabelText("Curso ou área"), { target: { value: "Sistemas — Noturno" } });
    fireEvent.change(screen.getByLabelText("Instituição de ensino"), { target: { value: "Instituto Federal" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar formação" }));
    expect(screen.getByRole("button", { name: /Remover formação: .*Instituto Federal/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() => expect(fetchMock.mock.calls.some((call) => (call as unknown as [string, RequestInit?])[1]?.method === "PUT")).toBe(true));
    const put = fetchMock.mock.calls.map((call) => call as unknown as [string, RequestInit?]).find((call) => call[1]?.method === "PUT")!;
    const body = JSON.parse(String(put[1]!.body));
    expect(body.education).toEqual([
      { level: "Ensino superior (graduação)", course: "Sistemas — Noturno", institution: "Instituto Federal", status: "Concluído" }
    ]);
    expect(body.languages).toEqual([]);
  });

  it("adds professional experiences as cargo, empresa and período and saves them structured", async () => {
    const fetchMock = await renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar experiência" }));
    expect(screen.getByText("Informe o cargo e a empresa para adicionar a experiência.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Cargo"), { target: { value: "Auxiliar administrativo" } });
    fireEvent.change(screen.getByLabelText("Empresa"), { target: { value: "Empresa Exemplo" } });
    fireEvent.change(screen.getByLabelText("Período (opcional)"), { target: { value: "03/2022 a 08/2024" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar experiência" }));
    expect(screen.getByRole("button", { name: /Remover experiência: Auxiliar administrativo/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() => expect(fetchMock.mock.calls.some((call) => (call as unknown as [string, RequestInit?])[1]?.method === "PUT")).toBe(true));
    const put = fetchMock.mock.calls.map((call) => call as unknown as [string, RequestInit?]).find((call) => call[1]?.method === "PUT")!;
    const body = JSON.parse(String(put[1]!.body));
    expect(body.professionalExperience).toEqual([{ role: "Auxiliar administrativo", company: "Empresa Exemplo", period: "03/2022 a 08/2024" }]);
    expect("skills" in body).toBe(false);
  });

  it("saves optional work preferences from modality, city, state and transport", async () => {
    const fetchMock = await renderEditor();
    expect(screen.getByRole("heading", { name: "Preferências de trabalho e deslocamento" })).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Remoto"));
    fireEvent.click(screen.getByLabelText("Híbrido"));
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Recife" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "PE" } });
    fireEvent.change(screen.getByLabelText("Meio de transporte principal"), { target: { value: "Ônibus" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    await waitFor(() => expect(fetchMock.mock.calls.some((call) => (call as unknown as [string, RequestInit?])[1]?.method === "PUT")).toBe(true));
    const put = fetchMock.mock.calls.map((call) => call as unknown as [string, RequestInit?]).find((call) => call[1]?.method === "PUT")!;
    expect(JSON.parse(String(put[1]!.body)).workPreferences).toEqual({
      modalities: ["Híbrido", "Remoto"], city: "Recife", state: "PE", address: "", transportMode: "Ônibus"
    });
  });

  it("shows validation messages inside the section they belong to", async () => {
    await renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar formação" }));
    const message = screen.getByText("Informe o curso ou área e a instituição para adicionar a formação.");
    expect(message.closest("section")?.querySelector("h2")?.textContent).toBe("Formação e escolaridade");
    expect(message.getAttribute("role")).toBe("alert");
  });

  it("keeps spaces while typing the free-text need and explains what is missing when saving", async () => {
    const fetchMock = await renderEditor();
    fireEvent.click(screen.getByLabelText("Preciso de adaptações de acessibilidade"));
    const field = screen.getByLabelText("Necessidade não contemplada pelo catálogo") as HTMLTextAreaElement;
    fireEvent.change(field, { target: { value: "usa " } });
    expect(field.value).toBe("usa ");
    fireEvent.change(field, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar perfil" }));
    const message = await screen.findByText(/Marque ao menos uma opção do catálogo ou descreva a necessidade/);
    expect(message.closest("section")?.querySelector("h2")?.textContent).toBe("Necessidades funcionais de acessibilidade");
    expect(fetchMock.mock.calls.some((call) => (call as unknown as [string, RequestInit?])[1]?.method === "PUT")).toBe(false);
  });

  it("places work preferences after courses and certifications", async () => {
    await renderEditor();
    const titles = Array.from(document.querySelectorAll("h2")).map((heading) => heading.textContent);
    expect(titles.indexOf("Preferências de trabalho e deslocamento")).toBe(titles.indexOf("Cursos e certificações") + 1);
  });
});
