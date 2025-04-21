
import axios from 'axios';
import { StockData, HistoricalDataPoint, TimeframeOption } from '@/types/market-data';

// Using Yahoo Finance API (via RapidAPI for more reliable access)
// Note: In a real implementation, you would move the API key to environment variables
const RAPIDAPI_KEY = 'demo-key';
const RAPIDAPI_HOST = 'yh-finance.p.rapidapi.com';

// Mock data for development when API calls are limited
const MOCK_STOCK_DATA: Record<string, StockData> = {
  'AAPL': { symbol: 'AAPL', price: 172.35, change: 1.25, changePercent: 0.73, timestamp: Date.now() },
  'MSFT': { symbol: 'MSFT', price: 345.27, change: -0.58, changePercent: -0.17, timestamp: Date.now() },
  'GOOGL': { symbol: 'GOOGL', price: 142.89, change: 0.86, changePercent: 0.61, timestamp: Date.now() },
  'AMZN': { symbol: 'AMZN', price: 162.64, change: 1.32, changePercent: 0.82, timestamp: Date.now() },
  'META': { symbol: 'META', price: 426.38, change: 3.21, changePercent: 0.76, timestamp: Date.now() },
};

// Generate mock historical data
const generateMockHistoricalData = (
  symbol: string, 
  timeframe: TimeframeOption
): HistoricalDataPoint[] => {
  const basePrice = MOCK_STOCK_DATA[symbol]?.price || 100;
  const points: HistoricalDataPoint[] = [];
  let days: number;
  
  switch(timeframe) {
    case '1D': days = 1; break;
    case '1W': days = 7; break;
    case '1M': days = 30; break;
    case '3M': days = 90; break;
    case '6M': days = 180; break;
    case '1Y': days = 365; break;
    case 'YTD': 
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
      break;
  }

  const dataPoints = timeframe === '1D' ? 24 : days;
  const volatility = timeframe === '1D' ? 0.005 : 0.02;

  // Start from current price and work backwards
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(now.getTime());
    
    if (timeframe === '1D') {
      // For intraday, go back by hours
      date.setHours(date.getHours() - i);
    } else {
      // For other timeframes, go back by days
      date.setDate(date.getDate() - i);
    }
    
    // Random price movement with some trend
    const change = currentPrice * (Math.random() * volatility * 2 - volatility);
    const high = currentPrice + Math.abs(change) * (1 + Math.random() * 0.5);
    const low = currentPrice - Math.abs(change) * (1 + Math.random() * 0.5);
    const open = currentPrice - change;
    
    points.unshift({
      date: date.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    });
    
    // Update the current price for the next iteration
    currentPrice = open;
  }
  
  return points;
};

// Function to get current stock data
export const getStockQuote = async (symbol: string): Promise<StockData> => {
  // For demo purposes, return mock data to avoid API rate limits
  if (MOCK_STOCK_DATA[symbol]) {
    return {
      ...MOCK_STOCK_DATA[symbol],
      timestamp: Date.now() // Update timestamp to simulate real-time data
    };
  }

  try {
    const response = await axios.get(`https://yh-finance.p.rapidapi.com/stock/v2/get-summary`, {
      params: {
        symbol,
        region: 'US'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const data = response.data;
    return {
      symbol: data.price.symbol,
      price: data.price.regularMarketPrice.raw,
      change: data.price.regularMarketChange.raw,
      changePercent: data.price.regularMarketChangePercent.raw,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw new Error('Failed to fetch stock data');
  }
};

// Function to get historical data
export const getHistoricalData = async (
  symbol: string, 
  timeframe: TimeframeOption
): Promise<HistoricalDataPoint[]> => {
  // For demo purposes, return mock data
  return generateMockHistoricalData(symbol, timeframe);

  // In a real implementation, you would make an API call like this:
  /*
  try {
    const response = await axios.get(`https://yh-finance.p.rapidapi.com/stock/v3/get-historical-data`, {
      params: {
        symbol,
        region: 'US'
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    const data = response.data.prices.map((item: any) => ({
      date: new Date(item.date * 1000).toISOString(),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
    return data;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw new Error('Failed to fetch historical data');
  }
  */
};

// Function to search for symbols
export const searchSymbols = async (query: string): Promise<Array<{ symbol: string, name: string }>> => {
  // Mock data for common symbols
  const mockSymbols = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' }
  ];
  
  if (!query) return mockSymbols;
  
  return mockSymbols.filter(item => 
    item.symbol.toLowerCase().includes(query.toLowerCase()) || 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
};
