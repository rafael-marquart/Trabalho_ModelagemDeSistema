import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";

const { prismaMock } = vi.hoisted(() => ({ prismaMock: { interviewEvaluation: { count: vi.fn(), groupBy: vi.fn() } } }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { getPublicRating } from "./service";
import PublicRating from "@/components/public-rating";

describe("public accessibility note (SPEC-021)", () => {
  beforeEach(() => { vi.clearAllMocks(); cleanup(); });

  it("is not shown without valid evaluations", async () => {
    prismaMock.interviewEvaluation.count.mockResolvedValue(0);
    expect(await getPublicRating("c1")).toEqual({ available: false, total: 0 });
    expect(prismaMock.interviewEvaluation.groupBy).not.toHaveBeenCalled();
  });

  it("shows the distribution from a single valid evaluation, by company, with counts only", async () => {
    prismaMock.interviewEvaluation.count.mockResolvedValue(1);
    prismaMock.interviewEvaluation.groupBy
      .mockResolvedValueOnce([{ accessibilityRating: 4, _count: { _all: 1 } }])
      .mockResolvedValueOnce([{ inclusionRating: 5, _count: { _all: 1 } }]);
    const rating = await getPublicRating("c1");
    expect(prismaMock.interviewEvaluation.count).toHaveBeenCalledWith({ where: { companyId: "c1" } });
    expect(rating).toEqual({ available: true, total: 1, accessibility: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 }, inclusion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 1 } });
    expect(JSON.stringify(rating)).not.toMatch(/candidate|comment|submittedAt|average|media/i);
  });

  it("renders an accessible distribution without an average", async () => {
    const { container } = render(React.createElement(PublicRating, { companyName: "Loja", rating: { available: true, total: 3, accessibility: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 }, inclusion: { 1: 1, 2: 0, 3: 0, 4: 2, 5: 0 } } }));
    expect(screen.getAllByRole("list")).toHaveLength(2);
    expect(screen.getAllByText("5 estrelas")).toHaveLength(2);
    expect(container.textContent).not.toMatch(/média \d|nota \d/i);
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it("says when there is not enough data, without suggesting a good or bad note", () => {
    render(React.createElement(PublicRating, { companyName: "Loja", rating: { available: false, total: 0 } }));
    expect(screen.getByText(/Ainda não há dados suficientes/).textContent).toContain("não indica que a acessibilidade seja boa ou ruim");
  });
});
