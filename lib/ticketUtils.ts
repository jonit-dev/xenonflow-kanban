import { Ticket } from '../types';

// Impact weights for priority sorting
const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

export const getImpactWeight = (impact: string): number => IMPACT_WEIGHTS[impact] || 1;

/**
 * Sort tickets by priority (impact first), then by start/end date as tiebreaker
 * - Higher impact items come first
 * - Within same impact, items with earlier start dates come first
 * - Items without dates fall to the bottom within their priority tier
 * - Finally falls back to position for items with no dates
 */
export const sortTicketsByPriority = (tickets: Ticket[]): Ticket[] => {
  return [...tickets].sort((a, b) => {
    const aImpact = getImpactWeight(a.impact);
    const bImpact = getImpactWeight(b.impact);

    // Sort by impact (higher first)
    if (aImpact !== bImpact) return bImpact - aImpact;

    // Same impact - sort by start date
    if (a.startDate && b.startDate) {
      const startCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (startCompare !== 0) return startCompare;
    }
    if (a.startDate) return -1;
    if (b.startDate) return 1;

    // Same impact, no start date - sort by end date
    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    if (a.endDate) return -1;
    if (b.endDate) return 1;

    // Same impact, no dates - maintain position order
    return (a.position || 0) - (b.position || 0);
  });
};
