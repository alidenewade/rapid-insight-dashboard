
import { useMemo } from 'react';
import { HistoricalDataPoint, ModelPrediction } from '@/types/market-data';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { simulateLSTMPredictions, simulateCNNPredictions } from '@/utils/modelSimulation';
import { Loader } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ModelPredictionChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
  isLoading: boolean;
}

const ModelPredictionChart = ({ data, symbol, isLoading }: ModelPredictionChartProps) => {
  const lstmPredictions = useMemo(() => {
    if (!data || data.length === 0) return [];
    return simulateLSTMPredictions(data);
  }, [data]);
  
  const cnnPredictions = useMemo(() => {
    if (!data || data.length === 0) return [];
    return simulateCNNPredictions(data);
  }, [data]);
  
  const combinedLSTMData = useMemo(() => {
    if (!data || data.length === 0 || !lstmPredictions || lstmPredictions.length === 0) return [];
    
    // Get last 10 actual data points
    const lastActualData = [...data].slice(-10).map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      price: point.close,
      isPrediction: false,
      confidence: 1
    }));
    
    // Format prediction data
    const predictionData = lstmPredictions.map(pred => ({
      date: new Date(pred.timestamp).toLocaleDateString(),
      price: pred.predictedPrice,
      isPrediction: true,
      confidence: pred.confidence
    }));
    
    return [...lastActualData, ...predictionData];
  }, [data, lstmPredictions]);
  
  const combinedCNNData = useMemo(() => {
    if (!data || data.length === 0 || !cnnPredictions || cnnPredictions.length === 0) return [];
    
    return cnnPredictions.map(pred => ({
      date: new Date(pred.timestamp).toLocaleDateString(),
      actual: pred.actualPrice,
      predicted: pred.predictedPrice,
      confidence: pred.confidence * 100, // Size based on confidence
      error: Math.abs(pred.predictedPrice - pred.actualPrice) / pred.actualPrice * 100 // Error percentage
    }));
  }, [data, cnnPredictions]);

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardHeader>
          <CardTitle>Loading Model Predictions</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ML Model Predictions for {symbol}</CardTitle>
        <CardDescription>
          Time series forecasts using simulated ML models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="lstm">
          <TabsList className="mb-4">
            <TabsTrigger value="lstm">LSTM Forecast</TabsTrigger>
            <TabsTrigger value="cnn">CNN Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lstm" className="mt-0">
            <div className="mb-4 p-4 bg-muted rounded-md text-sm">
              <p>
                This chart shows a 5-day price forecast using a simulated LSTM model. 
                In a real implementation, this would connect to a Python backend running actual deep learning models.
                Solid line shows historical data, dashed line shows predictions.
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={combinedLSTMData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  dot={false}
                  strokeDasharray="3 3"
                  name="Price"
                  isAnimationActive={false}
                />
                
                <ReferenceLine
                  x={combinedLSTMData.findIndex(d => d.isPrediction) > 0 ? 
                      combinedLSTMData[combinedLSTMData.findIndex(d => d.isPrediction) - 1].date : 
                      undefined}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{ value: 'Forecast Start', position: 'insideTopLeft', fill: '#666', fontSize: 12 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="cnn" className="mt-0">
            <div className="mb-4 p-4 bg-muted rounded-md text-sm">
              <p>
                This chart demonstrates a CNN model analyzing historical price patterns. 
                Points show actual vs predicted prices, with point size indicating prediction confidence.
                Vertical distance from the diagonal line represents prediction error.
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  type="number"
                  dataKey="actual"
                  name="Actual Price"
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  label={{ value: 'Actual Price', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted Price"
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  label={{ value: 'Predicted Price', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis
                  type="number"
                  dataKey="confidence"
                  range={[40, 120]}
                  name="Confidence"
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Confidence') {
                      return [`${value.toFixed(1)}%`, name];
                    }
                    return [`$${value.toFixed(2)}`, name];
                  }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Legend />
                
                <Scatter
                  name="Price Predictions"
                  data={combinedCNNData}
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1000, y: 1000 } // Will be clipped to domain
                  ]}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{ value: 'Perfect Prediction', position: 'insideTopLeft', fill: '#666', fontSize: 12 }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModelPredictionChart;
