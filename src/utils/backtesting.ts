
import { HistoricalDataPoint, BacktestResult } from '@/types/market-data';
import { calculateSMA, calculateRSI } from './technicalIndicators';

// Simple Moving Average Crossover Strategy
export const simpleMovingAverageCrossover = (
  data: HistoricalDataPoint[],
  shortPeriod: number = 10,
  longPeriod: number = 50
): BacktestResult => {
  const shortSMA = calculateSMA(data, shortPeriod);
  const longSMA = calculateSMA(data, longPeriod);
  
  let inPosition = false;
  let entryPrice = 0;
  let trades = 0;
  let wins = 0;
  let totalReturn = 0;
  let equityCurve = [1000]; // Start with $1000
  let maxEquity = 1000;
  let minEquity = 1000;
  
  // Skip the first longPeriod data points as we don't have enough data for indicators
  for (let i = longPeriod; i < data.length; i++) {
    const prevShort = shortSMA[i - 1];
    const prevLong = longSMA[i - 1];
    const currShort = shortSMA[i];
    const currLong = longSMA[i];
    
    // Buy signal: short SMA crosses above long SMA
    if (!inPosition && prevShort <= prevLong && currShort > currLong) {
      inPosition = true;
      entryPrice = data[i].close;
    }
    // Sell signal: short SMA crosses below long SMA
    else if (inPosition && prevShort >= prevLong && currShort < currLong) {
      inPosition = false;
      const exitPrice = data[i].close;
      const tradeReturn = (exitPrice / entryPrice) - 1;
      
      totalReturn += tradeReturn;
      trades++;
      if (tradeReturn > 0) wins++;
      
      // Update equity curve
      const prevEquity = equityCurve[equityCurve.length - 1];
      const newEquity = prevEquity * (1 + tradeReturn);
      equityCurve.push(newEquity);
      
      maxEquity = Math.max(maxEquity, newEquity);
      minEquity = Math.min(minEquity, newEquity);
    }
  }
  
  // If still in position at the end, close at the last price
  if (inPosition) {
    const exitPrice = data[data.length - 1].close;
    const tradeReturn = (exitPrice / entryPrice) - 1;
    
    totalReturn += tradeReturn;
    trades++;
    if (tradeReturn > 0) wins++;
    
    const prevEquity = equityCurve[equityCurve.length - 1];
    equityCurve.push(prevEquity * (1 + tradeReturn));
  }
  
  // Calculate metrics
  const winRate = trades > 0 ? wins / trades : 0;
  const maxDrawdown = (maxEquity - minEquity) / maxEquity;
  
  // Calculate annualized return
  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);
  const yearFraction = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const annualizedReturn = Math.pow(1 + totalReturn, 1 / yearFraction) - 1;
  
  // Calculate Sharpe ratio (simplified, assuming risk-free rate = 0)
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i] / equityCurve[i-1]) - 1);
  }
  
  const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length
  );
  
  const sharpeRatio = stdDev !== 0 ? (annualizedReturn / stdDev) : 0;
  
  return {
    strategy: `SMA Crossover (${shortPeriod}/${longPeriod})`,
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
    totalReturn: parseFloat((totalReturn * 100).toFixed(2)),
    annualizedReturn: parseFloat((annualizedReturn * 100).toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
    winRate: parseFloat((winRate * 100).toFixed(2)),
    trades
  };
};

// RSI Overbought/Oversold Strategy
export const rsiStrategy = (
  data: HistoricalDataPoint[],
  period: number = 14,
  overbought: number = 70,
  oversold: number = 30
): BacktestResult => {
  const rsiValues = calculateRSI(data, period);
  
  let inPosition = false;
  let entryPrice = 0;
  let trades = 0;
  let wins = 0;
  let totalReturn = 0;
  let equityCurve = [1000]; // Start with $1000
  let maxEquity = 1000;
  let minEquity = 1000;
  
  // Skip the first period data points as we don't have enough data for indicators
  for (let i = period + 1; i < data.length; i++) {
    const prevRSI = rsiValues[i - 1];
    const currRSI = rsiValues[i];
    
    // Buy signal: RSI crosses above oversold threshold
    if (!inPosition && prevRSI <= oversold && currRSI > oversold) {
      inPosition = true;
      entryPrice = data[i].close;
    }
    // Sell signal: RSI crosses above overbought threshold
    else if (inPosition && prevRSI <= overbought && currRSI > overbought) {
      inPosition = false;
      const exitPrice = data[i].close;
      const tradeReturn = (exitPrice / entryPrice) - 1;
      
      totalReturn += tradeReturn;
      trades++;
      if (tradeReturn > 0) wins++;
      
      // Update equity curve
      const prevEquity = equityCurve[equityCurve.length - 1];
      const newEquity = prevEquity * (1 + tradeReturn);
      equityCurve.push(newEquity);
      
      maxEquity = Math.max(maxEquity, newEquity);
      minEquity = Math.min(minEquity, newEquity);
    }
  }
  
  // If still in position at the end, close at the last price
  if (inPosition) {
    const exitPrice = data[data.length - 1].close;
    const tradeReturn = (exitPrice / entryPrice) - 1;
    
    totalReturn += tradeReturn;
    trades++;
    if (tradeReturn > 0) wins++;
    
    const prevEquity = equityCurve[equityCurve.length - 1];
    equityCurve.push(prevEquity * (1 + tradeReturn));
  }
  
  // Calculate metrics
  const winRate = trades > 0 ? wins / trades : 0;
  const maxDrawdown = (maxEquity - minEquity) / maxEquity;
  
  // Calculate annualized return
  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);
  const yearFraction = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const annualizedReturn = Math.pow(1 + totalReturn, 1 / yearFraction) - 1;
  
  // Calculate Sharpe ratio (simplified)
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i] / equityCurve[i-1]) - 1);
  }
  
  const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
  const stdDev = Math.sqrt(
    returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length
  );
  
  const sharpeRatio = stdDev !== 0 ? (annualizedReturn / stdDev) : 0;
  
  return {
    strategy: `RSI (${period}) Overbought/Oversold`,
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
    totalReturn: parseFloat((totalReturn * 100).toFixed(2)),
    annualizedReturn: parseFloat((annualizedReturn * 100).toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
    winRate: parseFloat((winRate * 100).toFixed(2)),
    trades
  };
};

// Simple Machine Learning Strategy Simulation
export const simulateMLStrategy = (
  data: HistoricalDataPoint[]
): BacktestResult => {
  // This is a simplified simulation of an ML strategy
  // In a real implementation, you'd use a trained model to make predictions
  
  let inPosition = false;
  let entryPrice = 0;
  let trades = 0;
  let wins = 0;
  let totalReturn = 0;
  let equityCurve = [1000]; // Start with $1000
  let maxEquity = 1000;
  let minEquity = 1000;
  
  // Randomly simulate ML predictions, but with a slight edge
  for (let i = 20; i < data.length; i++) {
    // Generate a "prediction" with a slight edge
    const predictedDirection = Math.random() > 0.48 ? 1 : -1;
    
    if (!inPosition && predictedDirection > 0) {
      // Buy signal
      inPosition = true;
      entryPrice = data[i].close;
    } else if (inPosition && (
      predictedDirection < 0 || 
      (data[i].close / entryPrice) > 1.05 || // 5% take profit
      (data[i].close / entryPrice) < 0.97    // 3% stop loss
    )) {
      // Sell signal
      inPosition = false;
      const exitPrice = data[i].close;
      const tradeReturn = (exitPrice / entryPrice) - 1;
      
      totalReturn += tradeReturn;
      trades++;
      if (tradeReturn > 0) wins++;
      
      // Update equity curve
      const prevEquity = equityCurve[equityCurve.length - 1];
      const newEquity = prevEquity * (1 + tradeReturn);
      equityCurve.push(newEquity);
      
      maxEquity = Math.max(maxEquity, newEquity);
      minEquity = Math.min(minEquity, newEquity);
    }
  }
  
  // If still in position at the end, close at the last price
  if (inPosition) {
    const exitPrice = data[data.length - 1].close;
    const tradeReturn = (exitPrice / entryPrice) - 1;
    
    totalReturn += tradeReturn;
    trades++;
    if (tradeReturn > 0) wins++;
    
    const prevEquity = equityCurve[equityCurve.length - 1];
    equityCurve.push(prevEquity * (1 + tradeReturn));
  }
  
  // Calculate metrics
  const winRate = trades > 0 ? wins / trades : 0;
  const maxDrawdown = maxEquity !== minEquity ? (maxEquity - minEquity) / maxEquity : 0;
  
  // Calculate annualized return
  const startDate = new Date(data[0].date);
  const endDate = new Date(data[data.length - 1].date);
  const yearFraction = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const annualizedReturn = Math.pow(1 + totalReturn, 1 / Math.max(yearFraction, 0.01)) - 1;
  
  // Calculate Sharpe ratio (simplified)
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i] / equityCurve[i-1]) - 1);
  }
  
  const avgReturn = returns.length > 0 ? returns.reduce((sum, val) => sum + val, 0) / returns.length : 0;
  const stdDev = returns.length > 0 ? 
    Math.sqrt(returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / returns.length) : 0;
  
  const sharpeRatio = stdDev !== 0 ? (annualizedReturn / stdDev) : 0;
  
  return {
    strategy: "ML-based Strategy (Simulation)",
    startDate: data[0].date,
    endDate: data[data.length - 1].date,
    totalReturn: parseFloat((totalReturn * 100).toFixed(2)),
    annualizedReturn: parseFloat((annualizedReturn * 100).toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    maxDrawdown: parseFloat((maxDrawdown * 100).toFixed(2)),
    winRate: parseFloat((winRate * 100).toFixed(2)),
    trades
  };
};
