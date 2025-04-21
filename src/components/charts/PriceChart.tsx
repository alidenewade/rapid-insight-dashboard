
import { useState, useMemo } from 'react';
import { HistoricalDataPoint, TimeframeOption, SamplingMethod } from '@/types/market-data';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands } from '@/utils/technicalIndicators';
import { generateVolumeSampledData } from '@/utils/modelSimulation';
import { Loader } from 'lucide-react';

interface PriceChartProps {
  symbol: string;
  data: HistoricalDataPoint[];
  isLoading: boolean;
}

const PriceChart = ({ symbol, data, isLoading }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('1M');
  const [samplingMethod, setSamplingMethod] = useState<SamplingMethod>('time');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollingerBands, setShowBollingerBands] = useState(false);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Apply sampling method
    const sampledData = samplingMethod === 'volume' 
      ? generateVolumeSampledData(data) 
      : data;
    
    // Calculate technical indicators
    const sma20 = calculateSMA(sampledData, 20);
    const ema9 = calculateEMA(sampledData, 9);
    const bbands = calculateBollingerBands(sampledData, 20, 2);
    
    // Format date for chart
    return sampledData.map((point, index) => {
      const date = new Date(point.date);
      const formattedDate = timeframe === '1D' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString();
        
      return {
        date: formattedDate,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
        sma20: showSMA ? sma20[index] : undefined,
        ema9: showEMA ? ema9[index] : undefined,
        upperBand: showBollingerBands ? bbands.upper[index] : undefined,
        middleBand: showBollingerBands ? bbands.middle[index] : undefined,
        lowerBand: showBollingerBands ? bbands.lower[index] : undefined,
      };
    });
  }, [data, timeframe, samplingMethod, showSMA, showEMA, showBollingerBands]);

  const timeframeOptions: TimeframeOption[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'];

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardHeader>
          <CardTitle>Loading Price Chart</CardTitle>
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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{symbol} Price Chart</CardTitle>
            <CardDescription>
              {samplingMethod === 'time' ? 'Time-based' : 'Volume-based'} sampling
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={samplingMethod === 'time' ? 'default' : 'outline'}
              onClick={() => setSamplingMethod('time')}
            >
              Time
            </Button>
            <Button
              size="sm"
              variant={samplingMethod === 'volume' ? 'default' : 'outline'}
              onClick={() => setSamplingMethod('volume')}
            >
              Volume
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {timeframeOptions.map((option) => (
            <Button
              key={option}
              size="sm"
              variant={timeframe === option ? 'default' : 'outline'}
              onClick={() => setTimeframe(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={showSMA ? 'default' : 'outline'}
            onClick={() => setShowSMA(!showSMA)}
          >
            SMA (20)
          </Button>
          <Button
            size="sm"
            variant={showEMA ? 'default' : 'outline'}
            onClick={() => setShowEMA(!showEMA)}
          >
            EMA (9)
          </Button>
          <Button
            size="sm"
            variant={showBollingerBands ? 'default' : 'outline'}
            onClick={() => setShowBollingerBands(!showBollingerBands)}
          >
            Bollinger Bands
          </Button>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={chartData}
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
              yAxisId="left"
              domain={['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <YAxis
              yAxisId="volume"
              orientation="left"
              domain={[0, 'dataMax']}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => 
                value === 0 ? '0' : 
                value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : 
                `${(value / 1000).toFixed(0)}K`
              }
              hide
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            
            <Bar 
              yAxisId="volume"
              dataKey="volume"
              barSize={20}
              fill="#8884d8"
              fillOpacity={0.3}
            />
            
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="close"
              fill="#8884d8"
              stroke="#8884d8"
              fillOpacity={0.2}
              strokeWidth={2}
              name="Price"
            />
            
            {showSMA && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sma20"
                stroke="#ff7300"
                dot={false}
                strokeWidth={2}
                name="SMA 20"
              />
            )}
            
            {showEMA && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ema9"
                stroke="#00bcd4"
                dot={false}
                strokeWidth={2}
                name="EMA 9"
              />
            )}
            
            {showBollingerBands && (
              <>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="upperBand"
                  stroke="#2196f3"
                  strokeDasharray="3 3"
                  dot={false}
                  name="Upper BB"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="middleBand"
                  stroke="#2196f3"
                  dot={false}
                  name="Middle BB"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="#2196f3"
                  strokeDasharray="3 3"
                  dot={false}
                  name="Lower BB"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
