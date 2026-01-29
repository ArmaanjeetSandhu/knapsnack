import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ExternalLink,
  FastForward,
  Key,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import { processCSVData } from "../lib/csvParser";
import api from "../services/api";

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

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setApiKeyError("Please enter an API key");
      return;
    }
    localStorage.setItem("usda_api_key", apiKey);
    setApiKeyError(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (!apiKey.trim()) {
      setApiKeyError("Please enter your API key first");
      return;
    }
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
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const result = processCSVData(results);
        if (result.success) {
          onFoodsImport(result.data);
          setSearchError(null);
        } else {
          setSearchError(result.error);
        }
      },
      error: (error) => {
        setSearchError(`Error reading file: ${error.message}`);
      },
    });
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
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const result = processCSVData(results);
          if (result.success) {
            onFoodsImport(result.data);
            setSearchError(null);
          } else {
            setSearchError(result.error);
          }
        },
        error: (error) => {
          setSearchError(`Error processing sample diet: ${error.message}`);
        },
      });
    } catch (error) {
      setSearchError(`Error loading sample diet: ${error.message}`);
    } finally {
      setSampleLoading(false);
    }
  };

  const isAdded = (foodId) => {
    return selectedFoodIds.includes(foodId) || recentlyAdded.has(foodId);
  };

  const errorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
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
            <Search className="w-5 h-5" />
            Search Foods
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence>
            {(searchError || apiKeyError) && (
              <motion.div
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mb-6"
              >
                <Alert variant="destructive">
                  <AlertDescription>
                    {searchError || apiKeyError}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <form onSubmit={handleApiKeySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  FoodData Central API Key
                </label>
                <p className="text-sm text-muted-foreground">
                  Get your free API key from{" "}
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
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1"
                />
              </div>
            </form>
          </motion.div>
          <motion.div
            className="flex flex-col md:flex-row gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <form onSubmit={handleSearch} className="flex-1">
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
              </div>
            </form>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => document.getElementById("csv-upload").click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </Button>
              <Button
                variant="secondary"
                onClick={handleTrySampleDiet}
                disabled={sampleLoading}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {sampleLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <FastForward className="w-4 h-4" />
                    <span>Try Sample Diet</span>
                  </>
                )}
              </Button>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </motion.div>
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div
                className="search-results"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* <h6 className="text-sm font-semibold mb-3">Search Results</h6> */}
                <ScrollArea className="h-[400px] rounded-md border">
                  <div className="divide-y">
                    <AnimatePresence initial={false}>
                      {searchResults.map((food, index) => {
                        const added = isAdded(food.fdcId);
                        return (
                          <motion.div
                            key={food.fdcId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.03,
                            }}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                          >
                            <span className="text-sm">{food.description}</span>
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
                                  added
                                    ? "bg-success hover:bg-success text-success-foreground"
                                    : ""
                                }`}
                              >
                                {added ? (
                                  <>
                                    <Check className="w-4 h-4 mr-1" />
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-1" />
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {searchResults.length === 0 &&
              searchTerm &&
              hasSearched &&
              !loading &&
              !searchError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-muted">
                    <AlertDescription>
                      No foods found matching your search. Try different
                      keywords.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FoodSearch;
