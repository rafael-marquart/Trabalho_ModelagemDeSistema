import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContrastProvider from "./contrast-provider";
import ThemeProvider from "./theme-provider";
import ThemeToggle from "./theme-toggle";

const fetchMock = vi.fn();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const setup = () => render(<ThemeProvider><ContrastProvider><ThemeToggle /></ContrastProvider></ThemeProvider>);

describe("high contrast control", () => {
  beforeEach(() => {
    fetchMock.mockReset(); window.localStorage.clear(); document.documentElement.removeAttribute("data-contrast");
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("follows the system by default and is off for anonymous visitors", async () => {
    fetchMock.mockResolvedValue(json({ message: "x" }, 401));
    setup(); await act(async () => {});
    expect(document.documentElement.dataset.contrast).toBe("auto");
    expect(screen.getByRole("button", { name: "Alto contraste" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles on, remembers in the browser and tries to save in the account", async () => {
    fetchMock.mockResolvedValue(json({ message: "x" }, 401));
    setup(); await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Alto contraste" }));
    await act(async () => {});
    expect(document.documentElement.dataset.contrast).toBe("high");
    expect(screen.getByRole("button", { name: "Alto contraste" }).getAttribute("aria-pressed")).toBe("true");
    expect(window.localStorage.getItem("acessa-vagas-contrast")).toBe("ON");
    const save = fetchMock.mock.calls.find(([, init]) => init?.method === "PUT");
    expect(JSON.parse(save![1].body)).toEqual({ preferences: { HIGH_CONTRAST: "ON" } });
    fireEvent.click(screen.getByRole("button", { name: "Alto contraste" }));
    expect(document.documentElement.dataset.contrast).toBe("normal");
  });

  it("applies the account preference when it exists, wherever the user logs in", async () => {
    fetchMock.mockResolvedValue(json({ preferences: { HIGH_CONTRAST: "ON" } }));
    setup(); await act(async () => {});
    expect(document.documentElement.dataset.contrast).toBe("high");
    expect(window.localStorage.getItem("acessa-vagas-contrast")).toBe("ON");
  });

  it("sends a choice made before login to an account that never set one", async () => {
    window.localStorage.setItem("acessa-vagas-contrast", "ON");
    fetchMock.mockResolvedValue(json({ preferences: { HIGH_CONTRAST: "AUTO" } }));
    setup(); await act(async () => {});
    expect(document.documentElement.dataset.contrast).toBe("high");
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === "PUT")).toBe(true);
  });
});
