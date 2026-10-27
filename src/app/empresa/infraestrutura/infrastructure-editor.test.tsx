import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import InfrastructureEditor from "./infrastructure-editor";
import { infrastructureCategories, infrastructureItems } from "@/lib/company-infrastructure/items";

const catalog = { categories: infrastructureCategories, items: infrastructureItems };
const emptyAnswers = Object.fromEntries(infrastructureItems.map((item) => [item.code, { status: "NOT_INFORMED", note: "" }]));

function stubFetch() {
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => ({
    ok: true, json: async () => init?.method === "PUT"
      ? { ok: true, catalog, answers: JSON.parse(String(init.body)).answers, updatedAt: "2026-10-27T10:00:00.000Z" }
      : { catalog, answers: emptyAnswers, updatedAt: null }
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}
async function renderEditor() {
  const fetchMock = stubFetch();
  render(<InfrastructureEditor />);
  await waitFor(() => expect((screen.getByRole("button", { name: "Salvar infraestrutura" }) as HTMLButtonElement).disabled).toBe(false));
  return fetchMock;
}
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("company infrastructure editor", () => {
  it("shows every category and item with a labelled control", async () => {
    await renderEditor();
    for (const category of infrastructureCategories) expect(screen.getByRole("heading", { name: category.label })).toBeTruthy();
    for (const item of infrastructureItems) expect(screen.getByRole("radiogroup", { name: new RegExp(item.label) })).toBeTruthy();
    const orphans = Array.from(document.querySelectorAll("label[for]")).filter((label) => !document.getElementById(label.getAttribute("for") ?? ""));
    expect(orphans).toHaveLength(0);
  });

  it("blocks saving and shows the message next to each pending required item", async () => {
    const fetchMock = await renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Salvar infraestrutura" }));
    const message = await screen.findByText("Informe se há ou não há: rampas de acesso.");
    expect(message.closest("section")?.querySelector("h2")?.textContent).toBe("Acesso físico e circulação");
    expect(message.getAttribute("role")).toBe("alert");
    expect(fetchMock.mock.calls.some((call) => (call as unknown as [string, RequestInit?])[1]?.method === "PUT")).toBe(false);
  });

  it("saves once every required item is answered", async () => {
    const fetchMock = await renderEditor();
    for (const item of infrastructureItems) {
      const group = screen.getByRole("radiogroup", { name: new RegExp(item.label) });
      fireEvent.click(group.querySelector("[role=radio]") as HTMLElement);
    }
    fireEvent.change(screen.getByLabelText(/Observação sobre rampas de acesso/), { target: { value: "só no prédio principal" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar infraestrutura" }));
    await screen.findByText(/Infraestrutura salva/);
    const put = fetchMock.mock.calls.map((call) => call as unknown as [string, RequestInit?]).find((call) => call[1]?.method === "PUT")!;
    const body = JSON.parse(String(put[1]!.body));
    expect(body.answers.RAMPS).toEqual({ status: "PRESENT", note: "só no prédio principal" });
    expect(Object.keys(body.answers)).toHaveLength(infrastructureItems.length);
  });

  it("makes every option its own tab stop and selects with the keyboard", async () => {
    await renderEditor();
    const group = screen.getByRole("radiogroup", { name: /Rampas de acesso/ });
    const radios = Array.from(group.querySelectorAll<HTMLElement>("[role=radio]"));
    expect(radios.map(radio => radio.tabIndex)).toEqual([0, 0]);
    expect(radios.map(radio => radio.getAttribute("aria-checked"))).toEqual(["false", "false"]);
    fireEvent.keyDown(radios[0], { key: "ArrowDown" });
    expect(radios[1].getAttribute("aria-checked")).toBe("true");
    expect(radios[0].getAttribute("aria-checked")).toBe("false");
  });
});
