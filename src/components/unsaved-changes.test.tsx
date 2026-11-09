/* eslint-disable @next/next/no-html-link-for-pages -- the guard must also work with plain links, so the test uses <a> on purpose */
import React, { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import { useUnsavedChangesGuard } from "./unsaved-changes";

function Page({ onSave, navigate, initiallyDirty = true }: { onSave?: () => Promise<boolean>; navigate: () => void; initiallyDirty?: boolean }) {
  const [dirty, setDirty] = useState(initiallyDirty);
  const { dialog } = useUnsavedChangesGuard({ dirty, onSave: onSave ? async () => { const ok = await onSave(); if (ok) setDirty(false); return ok; } : undefined });
  return <main>
    {dialog}
    <a href="/candidato/vagas" onClick={(event) => { event.preventDefault(); navigate(); }}>Vagas</a>
    <a href="#secao">Ir para a seção</a>
    <a href="https://example.org/fora">Outro site</a>
    <form action="/api/auth/logout" method="post"><button type="submit">Sair da conta</button></form>
  </main>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("unsaved changes guard (OPEN-101)", () => {
  it("does nothing while there is nothing unsaved", () => {
    const navigate = vi.fn();
    render(<Page navigate={navigate} onSave={vi.fn()} initiallyDirty={false} />);
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("heading", { name: "Deseja salvar as alterações antes de sair?" })).toBeNull();
  });

  it("asks before following a link of the site; Cancelar stays on the page", async () => {
    const navigate = vi.fn();
    const { container } = render(<Page navigate={navigate} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Deseja salvar as alterações antes de sair?" })).toBeTruthy();
    expect(screen.getAllByRole("button").map((button) => button.textContent).slice(0, 3)).toEqual(["Salvar e sair", "Sair sem salvar", "Cancelar"]);
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("heading", { name: "Deseja salvar as alterações antes de sair?" })).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("Sair sem salvar follows the link without saving", () => {
    const navigate = vi.fn(); const onSave = vi.fn();
    render(<Page navigate={navigate} onSave={onSave} />);
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    fireEvent.click(screen.getByRole("button", { name: "Sair sem salvar" }));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("Salvar e sair saves first and leaves only if the save worked", async () => {
    const navigate = vi.fn();
    const onSave = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(<Page navigate={navigate} onSave={onSave} />);
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Salvar e sair" })); });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Deseja salvar as alterações antes de sair?" })).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Salvar e sair" })); });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("asks before Sair da conta too, and logs out when confirmed", () => {
    const submit = vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => undefined);
    render(<Page navigate={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Sair da conta" }));
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Sair sem salvar" }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("lets anchors on the same page and other sites through (the browser warns about leaving the site)", () => {
    render(<Page navigate={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(screen.getByRole("link", { name: "Ir para a seção" }));
    expect(screen.queryByRole("heading", { name: "Deseja salvar as alterações antes de sair?" })).toBeNull();
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
  });

  it("forms that send instead of save offer only to leave without sending or to keep filling in", () => {
    const navigate = vi.fn();
    render(<Page navigate={navigate} />);
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    expect(screen.getByRole("heading", { name: "Sair sem enviar?" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Salvar e sair" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continuar preenchendo" }));
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Vagas" }));
    fireEvent.click(screen.getByRole("button", { name: "Sair sem enviar" }));
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
