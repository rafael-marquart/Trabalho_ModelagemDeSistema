import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ProfileEditor from "./profile-editor";

const emptyProfile = {
  education: [], skills: [], languages: [], professionalExperience: [], courses: [], certifications: [],
  professionalLinks: [], accessibilityDeclaration: "NOT_INFORMED", accessibilityNeeds: [],
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
  it("offers every approved professional category, including skills and experiences", async () => {
    await renderEditor();
    for (const title of ["Formação e escolaridade", "Idiomas", "Links profissionais", "Cursos e certificações",
      "Necessidades funcionais de acessibilidade", "Recursos de acessibilidade indispensáveis"]) {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    }
    expect(screen.getByLabelText("Competências")).toBeTruthy();
    expect(screen.getByLabelText("Experiências profissionais")).toBeTruthy();
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

  it("keeps the education separator unambiguous inside stored entries", async () => {
    await renderEditor();
    fireEvent.change(screen.getByLabelText("Curso ou área"), { target: { value: "Sistemas — Noturno" } });
    fireEvent.change(screen.getByLabelText("Instituição de ensino"), { target: { value: "Instituto Federal" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar formação" }));
    const entry = screen.getByText(/Instituto Federal/).textContent ?? "";
    expect(entry.split(" — ")).toEqual(["Ensino superior (graduação)", "Sistemas - Noturno", "Instituto Federal", "Concluído"]);
  });
});
