
import { useState, useEffect } from 'react';
import { StockData } from '@/types/market-data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TrendingUp, TrendingDown, SearchIcon, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchSymbols } from '@/services/marketDataService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StockTickerProps {
  stocks: StockData[];
  onSelectStock: (symbol: string) => void;
  isLoading: boolean;
  selectedSymbol: string;
}

const StockTicker = ({ stocks, onSelectStock, isLoading, selectedSymbol }: StockTickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string, name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 1) {
      setIsSearching(true);
      const fetchResults = async () => {
        try {
          const results = await searchSymbols(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching symbols:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };
      
      const timer = setTimeout(fetchResults, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectSearchResult = (symbol: string) => {
    setSearchQuery('');
    setSearchResults([]);
    onSelectStock(symbol);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
        <CardDescription>
          Live stock updates with real-time data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            {searchQuery.length > 0 && (
              <div className="absolute w-full mt-1 z-10 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      className={cn(
                        "w-full text-left px-4 py-2 hover:bg-accent flex items-center justify-between",
                        result.symbol === selectedSymbol && "bg-accent"
                      )}
                      onClick={() => handleSelectSearchResult(result.symbol)}
                    >
                      <span className="font-semibold">{result.symbol}</span>
                      <span className="text-muted-foreground text-sm truncate max-w-[70%]">{result.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="p-4 flex items-center justify-center h-24">
                <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
              </Card>
            ))
          ) : (
            stocks.map((stock) => (
              <Button
                key={stock.symbol}
                variant="outline"
                className={cn(
                  "h-auto p-4 flex flex-col items-start text-left",
                  stock.symbol === selectedSymbol && "border-primary bg-accent"
                )}
                onClick={() => onSelectStock(stock.symbol)}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold">{stock.symbol}</span>
                  <div className="flex items-center">
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={cn(
                        stock.change >= 0 ? "text-green-500" : "text-red-500"
                      )}
                    >
                      {stock.change > 0 && "+"}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <span className="text-xl mt-2">${stock.price.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Last updated: {new Date(stock.timestamp).toLocaleTimeString()}
                </span>
              </Button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockTicker;
