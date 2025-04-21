
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StockTicker from '@/components/market/StockTicker';
import PriceChart from '@/components/charts/PriceChart';
import TechnicalIndicatorsChart from '@/components/charts/TechnicalIndicatorsChart';
import BacktestResultsChart from '@/components/charts/BacktestResultsChart';
import ModelPredictionChart from '@/components/charts/ModelPredictionChart';
import { StockData, HistoricalDataPoint, TimeframeOption } from '@/types/market-data';
import { getStockQuote, getHistoricalData } from '@/services/marketDataService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL'];

const Dashboard = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');
  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(true);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState<boolean>(true);

  // Function to fetch stock data
  const fetchStockData = useCallback(async () => {
    setIsLoadingQuotes(true);
    try {
      const stockPromises = DEFAULT_SYMBOLS.map((symbol) => getStockQuote(symbol));
      const stockData = await Promise.all(stockPromises);
      setStocks(stockData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setIsLoadingQuotes(false);
    }
  }, []);

  // Function to fetch historical data
  const fetchHistoricalData = useCallback(async (symbol: string, timeframe: TimeframeOption) => {
    setIsLoadingHistorical(true);
    try {
      const data = await getHistoricalData(symbol, timeframe);
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setIsLoadingHistorical(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchStockData();
    fetchHistoricalData(selectedSymbol, timeframe);
    
    // Set up interval for refreshing stock data
    const interval = setInterval(() => {
      fetchStockData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [fetchStockData, fetchHistoricalData, selectedSymbol, timeframe]);

  // Handle symbol selection
  const handleSelectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    fetchHistoricalData(symbol, timeframe);
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: TimeframeOption) => {
    setTimeframe(newTimeframe);
    fetchHistoricalData(selectedSymbol, newTimeframe);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Market Analytics Dashboard</h1>
      
      <StockTicker 
        stocks={stocks} 
        onSelectStock={handleSelectStock} 
        isLoading={isLoadingQuotes} 
        selectedSymbol={selectedSymbol} 
      />
      
      <div className="mt-6">
        <Tabs defaultValue="charts" className="w-full">
          <TabsList>
            <TabsTrigger value="charts">Charts & Analysis</TabsTrigger>
            <TabsTrigger value="backtesting">Backtesting</TabsTrigger>
            <TabsTrigger value="models">ML Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="charts" className="mt-6 space-y-6">
            <PriceChart 
              symbol={selectedSymbol} 
              data={historicalData} 
              isLoading={isLoadingHistorical} 
            />
            <TechnicalIndicatorsChart 
              data={historicalData} 
              isLoading={isLoadingHistorical} 
            />
          </TabsContent>
          
          <TabsContent value="backtesting" className="mt-6">
            <BacktestResultsChart 
              data={historicalData} 
              symbol={selectedSymbol} 
              isLoading={isLoadingHistorical} 
            />
          </TabsContent>
          
          <TabsContent value="models" className="mt-6">
            <ModelPredictionChart 
              data={historicalData} 
              symbol={selectedSymbol} 
              isLoading={isLoadingHistorical} 
            />
            
            <div className="mt-6 p-6 bg-card border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">About The Model Simulations</h3>
              <p className="mb-4">
                This dashboard simulates ML models for financial forecasting. In a real implementation, these would connect to Python ML models running on a backend service.
              </p>
              
              <h4 className="font-semibold mt-4 mb-2">LSTM Time Series Forecast</h4>
              <p className="text-sm text-muted-foreground">
                Long Short-Term Memory networks are specialized deep learning models designed for sequence prediction problems.
                They're particularly effective for time series forecasting as they can learn long-term dependencies in sequential data.
                In finance, LSTM models can analyze patterns across multiple timeframes to predict future price movements.
              </p>
              
              <h4 className="font-semibold mt-4 mb-2">CNN Pattern Recognition</h4>
              <p className="text-sm text-muted-foreground">
                Convolutional Neural Networks excel at identifying spatial patterns in data.
                In financial markets, CNNs can detect patterns in price charts and technical indicators that may signal future price movements.
                They're also effective at analyzing multi-dimensional data, allowing them to process multiple indicators simultaneously.
              </p>
              
              <Separator className="my-6" />
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Note:</strong> This dashboard uses simulated predictions to demonstrate the UI/UX of a real financial analytics platform.</p>
                <p className="mt-2">For a production implementation, you would need:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>A Python backend with TensorFlow/PyTorch for model training and inference</li>
                  <li>Data preprocessing pipelines for feature engineering</li>
                  <li>Model versioning and monitoring</li>
                  <li>Real-time data feeds with proper error handling</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="mt-8 text-xs text-muted-foreground">
        <p>
          <strong>Disclaimer:</strong> This dashboard uses simulated market data for demonstration purposes. 
          In a real implementation, you would connect to actual financial data providers and use real-time APIs.
          The technical indicators, backtesting results, and ML predictions shown are for illustrative purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
