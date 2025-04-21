
import { useMemo } from 'react';
import { HistoricalDataPoint } from '@/types/market-data';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { calculateRSI, calculateMACD } from '@/utils/technicalIndicators';
import { Loader } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TechnicalIndicatorsChartProps {
  data: HistoricalDataPoint[];
  isLoading: boolean;
}

const TechnicalIndicatorsChart = ({ data, isLoading }: TechnicalIndicatorsChartProps) => {
  const rsiData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const rsi = calculateRSI(data, 14);
    
    return data.map((point, index) => {
      const date = new Date(point.date);
      return {
        date: date.toLocaleDateString(),
        rsi: rsi[index]
      };
    });
  }, [data]);
  
  const macdData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const { macdLine, signalLine, histogram } = calculateMACD(data);
    
    return data.map((point, index) => {
      const date = new Date(point.date);
      return {
        date: date.toLocaleDateString(),
        macdLine: macdLine[index],
        signalLine: signalLine[index],
        histogram: histogram[index],
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardHeader>
          <CardTitle>Loading Technical Indicators</CardTitle>
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
        <CardTitle>Technical Analysis</CardTitle>
        <CardDescription>
          View RSI and MACD indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rsi">
          <TabsList className="mb-4">
            <TabsTrigger value="rsi">RSI (14)</TabsTrigger>
            <TabsTrigger value="macd">MACD (12, 26, 9)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rsi" className="mt-0">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={rsiData}
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
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)}`, 'RSI']} />
                <Legend />
                <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#8884d8"
                  dot={false}
                  strokeWidth={2}
                  name="RSI (14)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="macd" className="mt-0">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart
                data={macdData}
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
                />
                <Tooltip formatter={(value: number) => [`${value.toFixed(2)}`, undefined]} />
                <Legend />
                <ReferenceLine y={0} stroke="#666" />
                <Line
                  type="monotone"
                  dataKey="macdLine"
                  stroke="#ff7300"
                  dot={false}
                  strokeWidth={2}
                  name="MACD Line"
                />
                <Line
                  type="monotone"
                  dataKey="signalLine"
                  stroke="#00bcd4"
                  dot={false}
                  strokeWidth={2}
                  name="Signal Line"
                />
                <Bar
                  dataKey="histogram"
                  fill="#8884d8"
                  name="Histogram"
                  barSize={5}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TechnicalIndicatorsChart;
