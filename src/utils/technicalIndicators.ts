
import { HistoricalDataPoint } from '@/types/market-data';

// Simple Moving Average (SMA)
export const calculateSMA = (data: HistoricalDataPoint[], period: number): number[] => {
  const smaValues: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      smaValues.push(NaN); // Not enough data for SMA yet
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    smaValues.push(parseFloat((sum / period).toFixed(2)));
  }
  
  return smaValues;
};

// Exponential Moving Average (EMA)
export const calculateEMA = (data: HistoricalDataPoint[], period: number): number[] => {
  const emaValues: number[] = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;
  
  emaValues.push(parseFloat(ema.toFixed(2)));
  
  // Calculate EMA for the rest of the data points
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    emaValues.push(parseFloat(ema.toFixed(2)));
  }
  
  // Pad the beginning with NaNs to match the length of the input data
  const padding = Array(data.length - emaValues.length).fill(NaN);
  return [...padding, ...emaValues];
};

// Relative Strength Index (RSI)
export const calculateRSI = (data: HistoricalDataPoint[], period: number = 14): number[] => {
  const rsiValues: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Pad with NaNs for the first value since we don't have price change
  rsiValues.push(NaN);
  
  // Calculate first average gain and loss
  let avgGain = gains.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
  
  // Calculate RSI for the first period
  let rs = avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  rsiValues.push(parseFloat(rsi.toFixed(2)));
  
  // Calculate RSI for the rest using smoothed averages
  for (let i = period + 1; i < data.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
    
    rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    
    rsiValues.push(parseFloat(rsi.toFixed(2)));
  }
  
  return rsiValues;
};

// Moving Average Convergence Divergence (MACD)
export const calculateMACD = (
  data: HistoricalDataPoint[], 
  fastPeriod: number = 12, 
  slowPeriod: number = 26, 
  signalPeriod: number = 9
): { macdLine: number[], signalLine: number[], histogram: number[] } => {
  // Calculate EMAs
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line
  const macdLine = fastEMA.map((fast, i) => {
    const slow = slowEMA[i];
    return isNaN(fast) || isNaN(slow) ? NaN : parseFloat((fast - slow).toFixed(2));
  });
  
  // Calculate Signal line (EMA of MACD line)
  let signalLine: number[] = [];
  const macdLineNoNaN = macdLine.filter(val => !isNaN(val));
  
  if (macdLineNoNaN.length > signalPeriod) {
    let sum = macdLineNoNaN.slice(0, signalPeriod).reduce((sum, val) => sum + val, 0);
    let signal = sum / signalPeriod;
    signalLine.push(parseFloat(signal.toFixed(2)));
    
    const multiplier = 2 / (signalPeriod + 1);
    for (let i = signalPeriod; i < macdLineNoNaN.length; i++) {
      signal = (macdLineNoNaN[i] - signal) * multiplier + signal;
      signalLine.push(parseFloat(signal.toFixed(2)));
    }
  }
  
  // Pad the signal line with NaNs to match the MACD line
  const padding = Array(macdLine.length - signalLine.length).fill(NaN);
  signalLine = [...padding, ...signalLine];
  
  // Calculate histogram (MACD line - Signal line)
  const histogram = macdLine.map((macd, i) => {
    const signal = signalLine[i];
    return isNaN(macd) || isNaN(signal) ? NaN : parseFloat((macd - signal).toFixed(2));
  });
  
  return { macdLine, signalLine, histogram };
};

// Bollinger Bands
export const calculateBollingerBands = (
  data: HistoricalDataPoint[], 
  period: number = 20, 
  stdDev: number = 2
): { upper: number[], middle: number[], lower: number[] } => {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(middle[i])) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    
    // Calculate standard deviation for the period
    let sumSquaredDiff = 0;
    for (let j = 0; j < period; j++) {
      if (i - j < 0) break;
      sumSquaredDiff += Math.pow(data[i - j].close - middle[i], 2);
    }
    const standardDeviation = Math.sqrt(sumSquaredDiff / period);
    
    upper.push(parseFloat((middle[i] + stdDev * standardDeviation).toFixed(2)));
    lower.push(parseFloat((middle[i] - stdDev * standardDeviation).toFixed(2)));
  }
  
  return { upper, middle, lower };
};

// Average True Range (ATR)
export const calculateATR = (data: HistoricalDataPoint[], period: number = 14): number[] => {
  const trValues: number[] = [];
  const atrValues: number[] = [];
  
  // Calculate True Range for each data point
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      trValues.push(data[i].high - data[i].low); // First TR is just high - low
      continue;
    }
    
    const tr1 = data[i].high - data[i].low; // Current high - current low
    const tr2 = Math.abs(data[i].high - data[i-1].close); // Current high - previous close
    const tr3 = Math.abs(data[i].low - data[i-1].close); // Current low - previous close
    
    trValues.push(Math.max(tr1, tr2, tr3));
  }
  
  // Calculate first ATR as simple average of TR
  let atr = 0;
  if (data.length >= period) {
    atr = trValues.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    atrValues.push(parseFloat(atr.toFixed(2)));
    
    // Calculate remaining ATR values using smoothing
    for (let i = period; i < data.length; i++) {
      atr = ((atr * (period - 1)) + trValues[i]) / period;
      atrValues.push(parseFloat(atr.toFixed(2)));
    }
  }
  
  // Pad with NaNs to match input length
  const padding = Array(data.length - atrValues.length).fill(NaN);
  return [...padding, ...atrValues];
};
