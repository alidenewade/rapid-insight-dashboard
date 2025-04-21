
import { useMemo } from 'react';
import { HistoricalDataPoint, BacktestResult } from '@/types/market-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  simpleMovingAverageCrossover,
  rsiStrategy,
  simulateMLStrategy
} from '@/utils/backtesting';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BacktestResultsChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
  isLoading: boolean;
}

const BacktestResultsChart = ({ data, symbol, isLoading }: BacktestResultsChartProps) => {
  const backtestResults = useMemo(() => {
    if (!data || data.length < 50) return [];
    
    // Run different backtest strategies
    const smaResult = simpleMovingAverageCrossover(data);
    const rsiResult = rsiStrategy(data);
    const mlResult = simulateMLStrategy(data);
    
    return [smaResult, rsiResult, mlResult];
  }, [data]);
  
  if (isLoading || !data || data.length < 50) {
    return (
      <Card className="w-full h-96">
        <CardHeader>
          <CardTitle>Backtesting</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading backtest results...' : 'Not enough data for backtesting'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          {isLoading && <Loader className="h-8 w-8 animate-spin text-muted-foreground" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Backtest Results for {symbol}</CardTitle>
        <CardDescription>
          Performance comparison of different trading strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Strategy</TableHead>
              <TableHead>Total Return</TableHead>
              <TableHead>Ann. Return</TableHead>
              <TableHead>Sharpe</TableHead>
              <TableHead>Max DD</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Trades</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backtestResults.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.strategy}</TableCell>
                <TableCell>
                  <Badge variant={result.totalReturn > 0 ? "default" : "destructive"} className={result.totalReturn > 0 ? "bg-green-500" : "bg-red-500"}>
                    {result.totalReturn > 0 ? '+' : ''}{result.totalReturn}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={result.annualizedReturn > 0 ? "default" : "destructive"} className={result.annualizedReturn > 0 ? "bg-green-500" : "bg-red-500"}>
                    {result.annualizedReturn > 0 ? '+' : ''}{result.annualizedReturn}%
                  </Badge>
                </TableCell>
                <TableCell>{result.sharpeRatio}</TableCell>
                <TableCell className="text-red-500">-{result.maxDrawdown}%</TableCell>
                <TableCell>{result.winRate}%</TableCell>
                <TableCell>{result.trades}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 p-4 bg-muted rounded-md text-sm">
          <h4 className="font-bold mb-2">Strategy Information:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>SMA Crossover:</strong> Buys when short SMA crosses above long SMA, sells on reverse.</li>
            <li><strong>RSI Strategy:</strong> Buys when RSI crosses above oversold (30), sells when overbought (70).</li>
            <li><strong>ML Strategy:</strong> Simulates predictions from a machine learning model with stop-loss and take-profit.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BacktestResultsChart;
