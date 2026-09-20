import { describe, expect, it } from "vitest";
import { Application, calculateFitScore, calculateRemainingConnects, getFitLabel } from "@/lib/assessment";
import { jobs, startingConnects } from "@/lib/jobs";

function application(jobId: string, answer = "Short answer"): Application {
  return {
    jobId,
    candidateName: "Zubair Tester",
    bidAmount: 1200,
    boostConnects: 0,
    milestone: "One milestone after complete delivery",
    coverLetter: "I will deliver this work with clean communication.",
    answer,
    selectedForRecord: false,
    appliedAt: "2026-09-20T12:00:00.000Z"
  };
}

describe("assessment scoring", () => {
  it("subtracts connects from applied jobs", () => {
    const boostedApplication = { ...application(jobs[2].id), boostConnects: 8 };
    const remaining = calculateRemainingConnects([application(jobs[0].id), boostedApplication], startingConnects);
    expect(remaining).toBe(startingConnects - jobs[0].connectsRequired - jobs[2].connectsRequired - 8);
  });

  it("gives a complete candidate a strong fit score", () => {
    const applications = jobs.map((job) =>
      application(
        job.id,
        "This is a detailed answer explaining architecture, testing, security, tradeoffs, delivery milestones, and job-specific risks."
      )
    );

    expect(calculateFitScore(applications, jobs.slice(0, 4).map((job) => job.id))).toBeGreaterThanOrEqual(85);
  });

  it("maps scores to readable labels", () => {
    expect(getFitLabel(90)).toBe("Excellent fit");
    expect(getFitLabel(70)).toBe("Promising fit");
    expect(getFitLabel(50)).toBe("Needs review");
    expect(getFitLabel(10)).toBe("Not enough signal");
  });
});
