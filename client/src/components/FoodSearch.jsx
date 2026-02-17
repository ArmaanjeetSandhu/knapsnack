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
import { processCSVData } from "../lib/csvParser";
import api from "../services/api";
import NotificationToast from "./common/NotificationToast";

const VirtualisedList = ({ items, height, itemHeight, renderItem }) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
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
      style={{
        height: `${height}px`,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item) => renderItem(item))}
        </div>
      </div>
    </div>
  );
};

const FoodSearch = ({ onFoodSelect, onFoodsImport, selectedFoodIds }) => {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("usda_api_key") || "",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const searchResultsRef = useRef(null);

  const handleParseComplete = (results) => {
    const result = processCSVData(results);
    if (result.success) {
      onFoodsImport(result.data);
      setSearchError(null);
    } else setSearchError(result.error);
  };

  const createParseConfig = (errorPrefix) => ({
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: handleParseComplete,
    error: (error) => {
      setSearchError(`${errorPrefix}: ${error.message}`);
    },
  });

  const handleApiKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    localStorage.setItem("usda_api_key", newKey);
    setApiKeyError(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearchError(null);
    try {
      const { results } = await api.searchFood(searchTerm, apiKey);
      setSearchResults(results);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err.message || "An error occurred while searching");
      setSearchResults([]);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodAdd = (food) => {
    onFoodSelect(food);
    setRecentlyAdded((prev) => new Set([...prev, food.fdcId]));
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const newSet = new Set(prev);
        newSet.delete(food.fdcId);
        return newSet;
      });
    }, 2000);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, createParseConfig("Error reading file"));
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
      Papa.parse(csvText, createParseConfig("Error processing sample diet"));
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setSampleLoading(false);
    }
  };

  const handleCloseResults = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  const isAdded = (foodId) => {
    return selectedFoodIds.includes(foodId) || recentlyAdded.has(foodId);
  };

  useEffect(() => {
    if (searchResults.length > 0 && searchResultsRef.current) {
      setTimeout(() => {
        const element = searchResultsRef.current;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 45;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [searchResults.length]);

  const renderFoodItem = (food) => {
    const added = isAdded(food.fdcId);

    return (
      <div
        key={food.fdcId}
        className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors border-b"
        style={{ height: "60px" }}
      >
        <span className="text-sm pr-4">{food.description}</span>
        <motion.div
          whileHover={{ scale: added ? 1 : 1.05 }}
          whileTap={{ scale: added ? 1 : 0.95 }}
        >
          <Button
            variant={added ? "success" : "secondary"}
            size="sm"
            onClick={() => !added && handleFoodAdd(food)}
            disabled={added}
            className={`ml-4 transition-all duration-200 ${
              added ? "bg-success hover:bg-success text-success-foreground" : ""
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
              </>
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
        <CardHeader className="bg-primary rounded-t-lg">
          <CardTitle className="text-white flex items-center gap-2">
            Add Foods
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence>
            {(searchError || apiKeyError) && (
              <NotificationToast
                message={searchError || apiKeyError}
                onDismiss={() => {
                  setSearchError(null);
                  setApiKeyError(null);
                }}
              />
            )}
          </AnimatePresence>

          <div className="mb-6 pb-4 border-b">
            <p className="text-sm text-muted-foreground">
              Choose any of the following options to add foods to your diet
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="border rounded-lg p-4 bg-muted/30 h-full">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    Quick Start
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
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
                        <FastForward className="w-4 h-4 mr-2" />
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
                <div className="border rounded-lg p-4 bg-muted/30 h-full">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    Import from CSV
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a CSV file with your food items
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("csv-upload").click()
                    }
                    className="w-full sm:w-auto"
                  >
                    <Upload className="w-4 h-4 mr-2" />
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
              <div className="border rounded-lg p-4 bg-muted/30">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
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
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
                <div className="mb-4 mt-3 ml-2">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <p className="text-xs text-muted-foreground italic">
                        Please enter a USDA FoodData Central API key to search
                        for food items:
                      </p>
                      <Input
                        type="text"
                        value={apiKey}
                        onChange={handleApiKeyChange}
                        placeholder=""
                        className="h-6 w-full md:w-64 rounded-full self-start"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Don&apos;t have an API key? Get one{" "}
                      <a
                        href="https://fdc.nal.usda.gov/api-key-signup.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary underline font-medium decoration-primary decoration-1 underline-offset-2 hover:decoration-2"
                      >
                        here
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      ref={searchResultsRef}
                      className="search-results border rounded-md overflow-hidden mt-6 bg-background"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
                        <h6 className="text-sm font-semibold">
                          Search Results ({searchResults.length} items)
                        </h6>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCloseResults}
                        >
                          <X className="w-4 h-4" />
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
