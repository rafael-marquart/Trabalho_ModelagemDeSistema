import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import ProfilePhotoEditor, { AccountAvatar, PersonAvatar, PHOTO_CHANGED_EVENT } from "./profile-photo";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("profile photo components (OPEN-101)", () => {
  it("shows the initials when there is no photo or it fails to load", () => {
    const { container, rerender } = render(<PersonAvatar name="Ana Souza" src={null} />);
    expect(container.textContent).toBe("AS");
    rerender(<PersonAvatar name="Ana Souza" src="/api/candidaturas/a1/foto" />);
    const image = container.querySelector("img")!;
    expect(image.getAttribute("alt")).toBe("");
    fireEvent.error(image);
    expect(container.textContent).toBe("AS");
  });

  it("the top-bar avatar asks for the photo only for candidates and recruiters and refreshes after a change", () => {
    const { container, rerender } = render(<AccountAvatar name="Ana Souza" withPhoto={false} />);
    expect(container.querySelector("img")).toBeNull();
    rerender(<AccountAvatar name="Ana Souza" withPhoto />);
    expect(container.querySelector("img")!.getAttribute("src")).toBe("/api/conta/foto?v=0");
    act(() => { window.dispatchEvent(new Event(PHOTO_CHANGED_EVENT)); });
    expect(container.querySelector("img")!.getAttribute("src")).toBe("/api/conta/foto?v=1");
  });

  it("uploads a chosen image, explains who sees it and offers to remove it afterwards", async () => {
    let hasPhoto = false;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "HEAD") return { ok: hasPhoto, json: async () => ({}) };
      if (init?.method === "POST") { hasPhoto = true; return { ok: true, json: async () => ({ ok: true }) }; }
      if (init?.method === "DELETE") { hasPhoto = false; return { ok: true, json: async () => ({ ok: true }) }; }
      return { ok: false, json: async () => ({}) };
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("confirm", () => true);
    const changed = vi.fn();
    window.addEventListener(PHOTO_CHANGED_EVENT, changed);
    const { container } = render(<ProfilePhotoEditor name="Ana Souza" note="A foto aparece para as empresas das vagas em que você se candidatar." />);
    expect(screen.getByText(/empresas das vagas em que você se candidatar/)).toBeTruthy();
    expect(await screen.findByRole("button", { name: "Escolher foto" })).toBeTruthy();
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File([new Uint8Array([0xff, 0xd8, 0xff])], "eu.jpg", { type: "image/jpeg" })] } });
    expect(await screen.findByText("Foto atualizada.")).toBeTruthy();
    const post = fetchMock.mock.calls.find((call) => (call as unknown as [string, RequestInit])[1]?.method === "POST") as unknown as [string, RequestInit];
    expect((post[1].body as FormData).get("photo")).toBeInstanceOf(Blob);
    expect(changed).toHaveBeenCalled();
    fireEvent.click(await screen.findByRole("button", { name: "Remover foto" }));
    expect(await screen.findByText("Foto removida.")).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("button", { name: "Escolher foto" })).toBeTruthy());
    expect((await axe.run(container)).violations).toEqual([]);
    window.removeEventListener(PHOTO_CHANGED_EVENT, changed);
  });

  it("refuses files that are not images before sending anything", async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, json: async () => ({}) }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ProfilePhotoEditor name="Ana" note="Opcional." />);
    fireEvent.change(container.querySelector("input[type=file]")!, { target: { files: [new File(["x"], "a.pdf", { type: "application/pdf" })] } });
    expect(await screen.findByText("Use uma imagem JPG, PNG ou WebP.")).toBeTruthy();
    expect(fetchMock.mock.calls.every((call) => (call as unknown as [string, RequestInit])[1]?.method === "HEAD")).toBe(true);
  });
});
