import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  FastForward,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import Papa from "papaparse";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { processCSVData, type CsvParseFailure } from "../lib/csvParser";
import api from "../services/api";
import type { FoodItem } from "../services/api";
import NotificationToast from "./common/NotificationToast";

interface VirtualisedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T) => React.ReactNode;
}

function VirtualisedList<T>({
  items,
  height,
  itemHeight,
  renderItem,
}: VirtualisedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight),
  );
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      onScroll={handleScroll}
      style={{ height: `${height}px`, overflow: "auto", position: "relative" }}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item) => renderItem(item))}
        </div>
      </div>
    </div>
  );
}

interface FoodSearchProps {
  onFoodSelect: (food: FoodItem) => void;
  onFoodsImport: (foods: FoodItem[]) => void;
  selectedFoodIds: Array<string | number>;
}

type RawCsvRow = Record<string, string | undefined>;

const FoodSearch = ({
  onFoodSelect,
  onFoodsImport,
  selectedFoodIds,
}: FoodSearchProps) => {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("usda_api_key") ?? "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string | number>>(
    new Set(),
  );
  const [hasSearched, setHasSearched] = useState(false);

  const searchResultsRef = useRef<HTMLDivElement>(null);

  const handleParseComplete = (results: Papa.ParseResult<RawCsvRow>) => {
    const result = processCSVData(results);
    if (result.success) {
      onFoodsImport(result.data);
      setSearchError(null);
    } else {
      setSearchError((result as CsvParseFailure).error);
    }
  };

  const createParseConfig = (
    errorPrefix: string,
  ): Papa.ParseConfig<RawCsvRow> => ({
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: handleParseComplete,
    error: (error: Papa.ParseError) => {
      setSearchError(`${errorPrefix}: ${error.message}`);
    },
  });

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("usda_api_key", newKey);
    setApiKeyError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearchError(null);
    try {
      const { results } = await api.searchFood(searchTerm, apiKey);
      setSearchResults(results);
      setHasSearched(true);
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching",
      );
      setSearchResults([]);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodAdd = (food: FoodItem) => {
    onFoodSelect(food);
    setRecentlyAdded((prev) => new Set([...prev, food.fdcId]));
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev);
        next.delete(food.fdcId);
        return next;
      });
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse<RawCsvRow>(file, createParseConfig("Error reading file"));
    event.target.value = "";
  };

  const handleTrySampleDiet = async () => {
    setSampleLoading(true);
    setSearchError(null);
    try {
      const response = await fetch("/sample.csv");
      if (!response.ok)
        throw new Error(`Failed to fetch sample diet (${response.status})`);
      const csvText = await response.text();
      Papa.parse<RawCsvRow>(
        csvText,
        createParseConfig("Error processing sample diet"),
      );
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSampleLoading(false);
    }
  };

  const handleCloseResults = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  const isAdded = (foodId: string | number): boolean =>
    selectedFoodIds.includes(foodId) || recentlyAdded.has(foodId);

  useEffect(() => {
    if (searchResults.length > 0 && searchResultsRef.current) {
      setTimeout(() => {
        const element = searchResultsRef.current;
        if (!element) return;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 45;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }, 100);
    }
  }, [searchResults.length]);

  const renderFoodItem = (food: FoodItem) => {
    const added = isAdded(food.fdcId);
    return (
      <div
        key={food.fdcId}
        className="flex items-center justify-between border-b px-4 py-3 transition-colors hover:bg-muted/50"
        style={{ height: "60px" }}
      >
        <span className="pr-4 text-sm">{food.description}</span>
        <motion.div
          whileHover={{ scale: added ? 1 : 1.05 }}
          whileTap={{ scale: added ? 1 : 0.95 }}
        >
          <Button
            variant={added ? "secondary" : "secondary"}
            size="sm"
            onClick={() => !added && handleFoodAdd(food)}
            disabled={added}
            className={`ml-4 transition-all duration-200 ${
              added
                ? "bg-green-500 text-white hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-600"
                : ""
            }`}
          >
            {added ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mb-6 shadow-lg">
        <CardHeader className="rounded-t-lg bg-primary">
          <CardTitle className="flex items-center gap-2 text-white">
            Add Foods
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence>
            {(searchError ?? apiKeyError) && (
              <NotificationToast
                message={(searchError ?? apiKeyError)!}
                onDismiss={() => {
                  setSearchError(null);
                  setApiKeyError(null);
                }}
              />
            )}
          </AnimatePresence>

          <div className="mb-6 border-b pb-4">
            <p className="text-sm text-muted-foreground">
              Choose any of the following options to add foods to your diet
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="h-full rounded-lg border bg-muted/30 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </span>
                    Quick Start
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Try a sample diet to see how it works
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleTrySampleDiet}
                    disabled={sampleLoading}
                    className="w-full sm:w-auto"
                  >
                    {sampleLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <>
                        <FastForward className="mr-2 h-4 w-4" />
                        <span>Load Sample Diet</span>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="h-full rounded-lg border bg-muted/30 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </span>
                    Import from CSV
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Upload or drag & drop a CSV file with your food items
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      (
                        document.getElementById(
                          "csv-upload",
                        ) as HTMLInputElement | null
                      )?.click()
                    }
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  Search Database
                </h3>

                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Search for foods..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setHasSearched(false);
                      }}
                      disabled={loading || !apiKey}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !apiKey || !searchTerm.trim()}
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mb-4 ml-2 mt-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <p className="text-xs italic text-muted-foreground">
                        Please enter a USDA FoodData Central API key to search
                        for food items:
                      </p>
                      <Input
                        type="text"
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        placeholder=""
                        className="h-6 w-full self-start rounded-full md:w-64"
                      />
                    </div>
                    <p className="text-xs italic text-muted-foreground">
                      Don&apos;t have an API key? Get one{" "}
                      <a
                        href="https://fdc.nal.usda.gov/api-key-signup.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary underline decoration-primary decoration-1 underline-offset-2 hover:decoration-2"
                      >
                        here
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      ref={searchResultsRef}
                      className="search-results mt-6 overflow-hidden rounded-md border bg-background"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
                        <h6 className="text-sm font-semibold">
                          Search Results ({searchResults.length} items)
                        </h6>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseResults}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <VirtualisedList
                        items={searchResults}
                        height={400}
                        itemHeight={60}
                        renderItem={renderFoodItem}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {searchResults.length === 0 &&
                    searchTerm &&
                    hasSearched &&
                    !loading &&
                    !searchError && (
                      <NotificationToast
                        message="No foods found matching your search. Try different keywords."
                        onDismiss={() => setHasSearched(false)}
                      />
                    )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FoodSearch;
