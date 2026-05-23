import { Report } from '@/types';

export const VERIFIED_SCORE_THRESHOLD = 50;
export const FROST_THRESHOLD_C = 3;

export function isReportHidden(report: Report): boolean {
  return report.downvotes >= 15 + report.upvotes * 3;
}

export function isVerifiedReporter(netScore: number): boolean {
  return netScore >= VERIFIED_SCORE_THRESHOLD;
}

export function getReliabilityPercent(report: Report): number {
  const total = report.upvotes + report.downvotes;
  if (total === 0) return 100;
  return Math.round((report.upvotes / total) * 100);
}

export function isFrostAlert(temperature: number): boolean {
  return temperature <= FROST_THRESHOLD_C;
}

const VOTED_KEY = 'anamurpin_votes';

export function getUserVotes(): Record<string, 'up' | 'down'> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function recordVote(reportId: string, voteType: 'up' | 'down'): void {
  if (typeof window === 'undefined') return;
  const votes = getUserVotes();
  votes[reportId] = voteType;
  localStorage.setItem(VOTED_KEY, JSON.stringify(votes));
}

export function hasVoted(reportId: string): 'up' | 'down' | null {
  return getUserVotes()[reportId] ?? null;
}
