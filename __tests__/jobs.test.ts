import { describe, expect, it } from "vitest";
import { jobs, startingConnects, totalConnectsRequired } from "@/lib/jobs";

describe("job seed data", () => {
  it("contains seven jobs and seven bids per job", () => {
    expect(jobs).toHaveLength(7);
    expect(jobs.every((job) => job.bids.length === 7)).toBe(true);
  });

  it("forces prioritization: the seven jobs cost more than the starting connects", () => {
    expect(startingConnects).toBe(50);
    expect(totalConnectsRequired).toBeGreaterThan(startingConnects);
    expect(jobs.some((job) => job.connectsRequired === 30)).toBe(true);
  });

  it("includes high-spend bids over 100 connects", () => {
    const highSpendBids = jobs.flatMap((job) => job.bids).filter((bid) => bid.connectsSpent > 100);
    expect(highSpendBids.length).toBeGreaterThanOrEqual(3);
  });
});
