import { jobs } from "./jobs";

export type Application = {
  jobId: string;
  candidateName: string;
  bidAmount: number;
  boostConnects: number;
  milestone: string;
  milestoneTitle?: string;
  milestoneDescription?: string;
  coverLetter: string;
  answer: string;
  selectedForRecord: boolean;
  appliedAt: string;
};

export function calculateRemainingConnects(applications: Application[], startingConnects: number) {
  const spent = applications.reduce((sum, application) => {
    const job = jobs.find((item) => item.id === application.jobId);
    return sum + (job?.connectsRequired ?? 0) + application.boostConnects;
  }, 0);

  return Math.max(startingConnects - spent, 0);
}

export function calculateFitScore(applications: Application[], viewedJobIds: string[]) {
  const applicationScore = applications.length * 9;
  const detailScore = applications.filter((application) => application.answer.trim().length >= 90).length * 5;
  const recordScore = applications.filter((application) => application.selectedForRecord).length * 3;
  const viewedScore = viewedJobIds.length * 2;
  const allJobsBonus = applications.length === jobs.length ? 14 : 0;

  return Math.min(100, applicationScore + detailScore + recordScore + viewedScore + allJobsBonus);
}

export function getFitLabel(score: number) {
  if (score >= 85) {
    return "Excellent fit";
  }

  if (score >= 65) {
    return "Promising fit";
  }

  if (score >= 42) {
    return "Needs review";
  }

  return "Not enough signal";
}
