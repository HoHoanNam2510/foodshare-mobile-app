// ── Query Types ──────────────────────────────────────────────
export type StatisticsRange = '7d' | '30d' | '12m' | 'custom';

export type PostTypeFilter = 'P2P_FREE' | 'B2C_MYSTERY_BAG' | 'ALL';

export interface IStatisticsQuery {
  range: StatisticsRange;
  from?: string; // ISO date string
  to?: string; // ISO date string
  compareFrom?: string;
  compareTo?: string;
  postType?: PostTypeFilter;
}

// ── Response Types ───────────────────────────────────────────
export interface ITimeseriesPoint {
  name: string;
  given: number;
  received: number;
  revenue: number;
}

export interface IStatsSummary {
  totalGiven: number;
  totalReceived: number;
  totalRevenue: number;
  txCount: number;
}

export interface ITopItem {
  postId: string;
  title: string;
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  count: number;
}

export interface ITopCounterpart {
  userId: string;
  fullName: string;
  avatar?: string;
  count: number;
}

export interface IComparison {
  previousTimeseries: ITimeseriesPoint[];
  givenPct: number | null;
  receivedPct: number | null;
  revenuePct: number | null;
  pointsPct: number | null;
}

export interface IStatisticsData {
  timeseries: ITimeseriesPoint[];
  summary: IStatsSummary;
  topItems: ITopItem[];
  topCounterparts: ITopCounterpart[];
  totalGreenPointsEarned: number;
  compare?: IComparison;
}

export interface IStatisticsResponse {
  success: boolean;
  data: IStatisticsData;
}
