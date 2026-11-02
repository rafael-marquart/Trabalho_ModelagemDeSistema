import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import axe from "axe-core";
import StagingBanner from "./staging-banner";

describe("test environment banner", () => {
  it("appears only in the test environment and says that e-mails do not reach anyone", async () => {
    const { container, rerender } = render(<StagingBanner appEnv="production" />);
    expect(container.textContent).toBe("");
    rerender(<StagingBanner appEnv={undefined} />);
    expect(container.textContent).toBe("");
    rerender(<StagingBanner appEnv="staging" />);
    expect(screen.getByRole("complementary", { name: "Aviso do ambiente" }).textContent).toContain("não chegam a ninguém");
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
