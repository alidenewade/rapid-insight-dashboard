
import { HistoricalDataPoint, ModelPrediction } from '@/types/market-data';

// Function to simulate LSTM model predictions
export const simulateLSTMPredictions = (
  historicalData: HistoricalDataPoint[],
  daysToPredict: number = 5,
  confidence: number = 0.85
): ModelPrediction[] => {
  // We're simulating ML model predictions here
  // In a real implementation, this would call a Python backend with actual models
  
  const predictions: ModelPrediction[] = [];
  const latestData = [...historicalData].slice(-30); // Use last 30 days for prediction basis
  
  // Find the trend over the recent past
  const recentTrend = latestData.length > 5 ? 
    (latestData[latestData.length-1].close / latestData[latestData.length-6].close) - 1 : 0;
  
  // Calculate average daily volatility
  let avgVolatility = 0;
  for (let i = 1; i < latestData.length; i++) {
    avgVolatility += Math.abs(latestData[i].close / latestData[i-1].close - 1);
  }
  avgVolatility /= (latestData.length - 1);
  
  // Generate predictions
  let lastPrice = historicalData[historicalData.length - 1].close;
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  
  for (let i = 1; i <= daysToPredict; i++) {
    // Generate prediction with some randomness but following the trend
    const trendFactor = Math.random() * 0.6 + 0.7; // 0.7 to 1.3
    const dailyMove = recentTrend / 5 * trendFactor; // Daily move based on recent trend
    const randomness = (Math.random() - 0.5) * avgVolatility * 2; // Random component
    
    const predictedMove = dailyMove + randomness;
    const predictedPrice = lastPrice * (1 + predictedMove);
    
    // Calculate prediction date
    const predictionDate = new Date(lastDate);
    predictionDate.setDate(predictionDate.getDate() + i);
    
    // Vary confidence slightly
    const predictionConfidence = confidence - (i * 0.03); // Confidence decreases with time
    
    predictions.push({
      timestamp: predictionDate.toISOString(),
      actualPrice: NaN, // Unknown for future dates
      predictedPrice: parseFloat(predictedPrice.toFixed(2)),
      confidence: parseFloat(predictionConfidence.toFixed(2))
    });
    
    // Update last price for next iteration
    lastPrice = predictedPrice;
  }
  
  return predictions;
};

// Function to simulate CNN prediction on recent data
export const simulateCNNPredictions = (
  historicalData: HistoricalDataPoint[]
): ModelPrediction[] => {
  // This simulates a CNN model that predicts based on recent price patterns
  // In a real implementation, this would call a Python backend
  
  const predictions: ModelPrediction[] = [];
  const dataForPredictions = [...historicalData].slice(-20); // Use last 20 days
  
  // Generate "predictions" for the data we already have to demonstrate the concept
  for (let i = 0; i < dataForPredictions.length; i++) {
    const actualPrice = dataForPredictions[i].close;
    
    // For simulation, we'll make the model somewhat accurate but not perfect
    const errorPercent = (Math.random() - 0.5) * 0.03; // -1.5% to +1.5% error
    const predictedPrice = actualPrice * (1 + errorPercent);
    
    // Higher confidence for less volatile periods
    const priceChange = i > 0 ? Math.abs(dataForPredictions[i].close / dataForPredictions[i-1].close - 1) : 0;
    const confidenceModifier = Math.min(0.1, priceChange * 5); // More volatility = less confidence
    const confidence = 0.9 - confidenceModifier;
    
    predictions.push({
      timestamp: dataForPredictions[i].date,
      actualPrice: actualPrice,
      predictedPrice: parseFloat(predictedPrice.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2))
    });
  }
  
  return predictions;
};

// Function to generate volume-based sampled data
export const generateVolumeSampledData = (
  timeData: HistoricalDataPoint[]
): HistoricalDataPoint[] => {
  // Sort data by date to ensure chronological order
  const sortedData = [...timeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedData.length < 10) {
    return sortedData; // Not enough data to resample
  }
  
  // Calculate total volume
  const totalVolume = sortedData.reduce((sum, point) => sum + point.volume, 0);
  
  // Define the number of volume bars we want (arbitrary)
  const numVolumeBars = Math.min(sortedData.length, 20);
  
  // Calculate volume per bar
  const volumePerBar = totalVolume / numVolumeBars;
  
  const volumeBars: HistoricalDataPoint[] = [];
  let currentBar: HistoricalDataPoint | null = null;
  let accumulatedVolume = 0;
  
  for (const dataPoint of sortedData) {
    if (!currentBar) {
      // Initialize new bar with first data point
      currentBar = { ...dataPoint };
      accumulatedVolume = dataPoint.volume;
    } else {
      // Update current bar
      accumulatedVolume += dataPoint.volume;
      currentBar.high = Math.max(currentBar.high, dataPoint.high);
      currentBar.low = Math.min(currentBar.low, dataPoint.low);
      currentBar.close = dataPoint.close; // Close of the bar is the last price
      currentBar.date = dataPoint.date; // Date of the bar is the last date
      
      // If we've accumulated enough volume, finalize the bar
      if (accumulatedVolume >= volumePerBar) {
        volumeBars.push({ ...currentBar, volume: accumulatedVolume });
        currentBar = null;
        accumulatedVolume = 0;
      }
    }
  }
  
  // Add the last bar if it exists
  if (currentBar) {
    volumeBars.push({ ...currentBar, volume: accumulatedVolume });
  }
  
  return volumeBars;
};
