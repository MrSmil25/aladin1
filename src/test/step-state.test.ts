import { describe, expect, it } from "vitest";
import { applyDeposit, crossedMilestones, initialState } from "@/lib/store";
describe("STEP deposits", () => {
  it("transfers funds without changing total savings", () => {
    const next = applyDeposit(initialState, 25_000);
    expect(next.haji.saldo).toBe(initialState.haji.saldo + 25_000);
    expect(next.dompet.saldo).toBe(initialState.dompet.saldo - 25_000);
    expect(next.haji.saldo + next.dompet.saldo).toBe(initialState.haji.saldo + initialState.dompet.saldo);
    expect(next.deposits[0]?.amount).toBe(25_000);
    expect(next.userState).toBe("aktif");
  });
  it("rejects small, fractional, and unaffordable deposits", () => {
    for (const amount of [0, 9999, 10_000.5, NaN, initialState.dompet.saldo + 1]) expect(() => applyDeposit(initialState, amount)).toThrow();
  });
  it("celebrates only newly crossed milestones, including multiple thresholds", () => {
    expect(crossedMilestones(990_000, 1_000_000).map(m => m.name)).toEqual(["Langkah Pertama"]);
    expect(crossedMilestones(1_000_000, 1_010_000)).toEqual([]);
    expect(crossedMilestones(990_000, 5_010_000)).toHaveLength(2);
  });
});
