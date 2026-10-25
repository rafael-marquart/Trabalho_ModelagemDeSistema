import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ThemeProvider, { useTheme } from "./theme-provider";
import ThemeToggle from "./theme-toggle";

function ThemeProbe() {
  const { theme } = useTheme();
  return <output data-testid="theme">{theme}</output>;
}

describe("accessible theme preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to light when no saved or system preference exists", async () => {
    render(<ThemeProvider><ThemeProbe /><ThemeToggle /></ThemeProvider>);
    await act(async () => {});

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(screen.getByRole("button", { name: "Ativar tema escuro" })).toBeTruthy();
  });

  it("restores a saved dark theme preference", async () => {
    window.localStorage.setItem("acessa-vagas-theme", "dark");
    render(<ThemeProvider><ThemeProbe /><ThemeToggle /></ThemeProvider>);
    await act(async () => {});

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Ativar tema claro" })).toBeTruthy();
  });

  it("persists theme changes when the user activates the control", async () => {
    render(<ThemeProvider><ThemeProbe /><ThemeToggle /></ThemeProvider>);
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ativar tema escuro" }));
    });
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("acessa-vagas-theme")).toBe("dark");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Ativar tema claro" }));
    });
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(window.localStorage.getItem("acessa-vagas-theme")).toBe("light");
  });
});
