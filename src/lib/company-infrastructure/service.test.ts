import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({ prismaMock: { companyInfrastructure: { findUnique: vi.fn() } } }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { getCompanyInfrastructure } from "./service";

describe("getCompanyInfrastructure", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exposes declared data and keeps everything else as NOT_INFORMED", async () => {
    prismaMock.companyInfrastructure.findUnique.mockResolvedValueOnce({
      answers: { RAMPS: { status: "PRESENT", note: "entrada principal" } }, updatedAt: new Date("2026-10-27T10:00:00.000Z")
    });
    const summary = await getCompanyInfrastructure("company-1");
    expect(prismaMock.companyInfrastructure.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: "company-1" } }));
    expect(summary.items.find((item) => item.code === "RAMPS")).toMatchObject({ status: "PRESENT", note: "entrada principal" });
    expect(summary.items.find((item) => item.code === "ELEVATORS")?.status).toBe("NOT_INFORMED");
  });

  it("reports a company without registration as entirely not informed", async () => {
    prismaMock.companyInfrastructure.findUnique.mockResolvedValueOnce(null);
    const summary = await getCompanyInfrastructure("company-2");
    expect(summary.updatedAt).toBeNull();
    expect(summary.items.every((item) => item.status === "NOT_INFORMED")).toBe(true);
  });
});
