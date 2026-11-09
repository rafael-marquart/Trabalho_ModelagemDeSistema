import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import PasswordInput from "./password-input";

afterEach(cleanup);

describe("PasswordInput", () => {
  it("shows and hides the password with an accessible toggle", async () => {
    const { container } = render(<form><label htmlFor="pw">Senha</label><PasswordInput id="pw" defaultValue="Segredo123" /></form>);
    const input = screen.getByLabelText("Senha") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    expect(input.type).toBe("password");
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.getAttribute("type")).toBe("button");
    fireEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(toggle);
    expect(input.type).toBe("password");
  });

  it("hides the password again when the form is sent and keeps the other field's label distinct", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(<form onSubmit={onSubmit}>
      <label htmlFor="a">Senha</label><PasswordInput id="a" />
      <label htmlFor="b">Confirmar senha</label><PasswordInput id="b" toggleLabel="Mostrar confirmação da senha" />
      <button type="submit">Enviar</button>
    </form>);
    fireEvent.click(screen.getByRole("button", { name: "Mostrar confirmação da senha" }));
    expect((screen.getByLabelText("Confirmar senha") as HTMLInputElement).type).toBe("text");
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((screen.getByLabelText("Confirmar senha") as HTMLInputElement).type).toBe("password");
  });
});
