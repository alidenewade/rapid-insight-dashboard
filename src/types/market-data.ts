
export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  close: number;
  low: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  color: string;
}

export interface BacktestResult {
  strategy: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  trades: number;
}

export interface ModelPrediction {
  timestamp: string;
  actualPrice: number;
  predictedPrice: number;
  confidence: number;
}

export type TimeframeOption = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD';
export type SamplingMethod = 'time' | 'volume';
