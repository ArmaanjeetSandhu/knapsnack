import { useState } from "react";
import PropTypes from "prop-types";
import { Search, Plus, Key, ExternalLink, Upload, Check } from "lucide-react";
import Papa from "papaparse";
import api from "../services/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
const FoodSearch = ({ onFoodSelect, onFoodsImport, selectedFoodIds }) => {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("usda_api_key") || ""
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(new Set());
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
      setApiKeyError("Please enter your USDA API key first");
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const { results } = await api.searchFood(searchTerm, apiKey);
      setSearchResults(results);
    } catch (err) {
      setSearchError(err.message || "An error occurred while searching");
      setSearchResults([]);
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
        if (results.errors.length > 0) {
          setSearchError(
            "Error parsing CSV file. Please ensure the file format is correct."
          );
          return;
        }
        try {
          const importedFoods = results.data.map((row) => {
            const servingSize = row["Serving Size (g)"] || 100;
            const normalizedNutrients = {
              "Vitamin A (µg)": (row["Vitamin A (µg)"] * 100) / servingSize,
              "Vitamin C (mg)": (row["Vitamin C (mg)"] * 100) / servingSize,
              "Vitamin E (mg)": (row["Vitamin E (mg)"] * 100) / servingSize,
              "Vitamin K (µg)": (row["Vitamin K (µg)"] * 100) / servingSize,
              "Thiamin (mg)": (row["Thiamin (mg)"] * 100) / servingSize,
              "Riboflavin (mg)": (row["Riboflavin (mg)"] * 100) / servingSize,
              "Niacin (mg)": (row["Niacin (mg)"] * 100) / servingSize,
              "Vitamin B6 (mg)": (row["Vitamin B6 (mg)"] * 100) / servingSize,
              "Folate (µg)": (row["Folate (µg)"] * 100) / servingSize,
              "Calcium (mg)": (row["Calcium (mg)"] * 100) / servingSize,
              carbohydrate: (row["Carbohydrate (g)"] * 100) / servingSize,
              "Choline (mg)": (row["Choline (mg)"] * 100) / servingSize,
              protein: (row["Protein (g)"] * 100) / servingSize,
              fats: (row["Fats (g)"] * 100) / servingSize,
              saturated_fats: (row["Saturated Fats (g)"] * 100) / servingSize,
              fiber: (row["Fiber (g)"] * 100) / servingSize,
              "Iron (mg)": (row["Iron (mg)"] * 100) / servingSize,
              "Magnesium (mg)": (row["Magnesium (mg)"] * 100) / servingSize,
              "Manganese (mg)": (row["Manganese (mg)"] * 100) / servingSize,
              "Phosphorus (mg)": (row["Phosphorus (mg)"] * 100) / servingSize,
              "Selenium (µg)": (row["Selenium (µg)"] * 100) / servingSize,
              "Zinc (mg)": (row["Zinc (mg)"] * 100) / servingSize,
              "Potassium (mg)": (row["Potassium (mg)"] * 100) / servingSize,
              "Sodium (mg)": (row["Sodium (mg)"] * 100) / servingSize,
              "Pantothenic Acid (mg)":
                (row["Pantothenic Acid (mg)"] * 100) / servingSize,
            };
            return {
              fdcId: row["FDC ID"].toString(),
              description: row["Food Item"],
              price: row["Price (₹)"],
              servingSize: row["Serving Size (g)"],
              maxServing: row["Max Serving (g)"],
              nutrients: normalizedNutrients,
            };
          });
          onFoodsImport(importedFoods);
          setSearchError(null);
        } catch {
          setSearchError(
            "Invalid CSV format. Please use a CSV file exported from this application."
          );
        }
      },
      error: (error) => {
        setSearchError(`Error reading file: ${error.message}`);
      },
    });
    event.target.value = "";
  };
  const isAdded = (foodId) => {
    return selectedFoodIds.includes(foodId) || recentlyAdded.has(foodId);
  };
  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary">
        <CardTitle className="text-white flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Foods
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {(searchError || apiKeyError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{searchError || apiKeyError}</AlertDescription>
          </Alert>
        )}
        <div className="mb-6">
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                USDA API Key
              </label>
              <p className="text-sm text-muted-foreground">
                Get your free API key from{" "}
                <a
                  href="https://fdc.nal.usda.gov/api-key-signup.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
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
                placeholder="Enter your USDA API key"
                className="flex-1"
              />
            </div>
          </form>
        </div>
        <div className="flex gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading || !apiKey}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading || !apiKey}
                className="min-w-[100px]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Searching</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
          <Button
            variant="outline"
            onClick={() => document.getElementById("csv-upload").click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="search-results">
            <h6 className="text-sm font-semibold mb-3">Search Results</h6>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="divide-y">
                {searchResults.map((food) => {
                  const added = isAdded(food.fdcId);
                  return (
                    <div
                      key={food.fdcId}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{food.description}</span>
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
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>
        )}
        {searchResults.length === 0 &&
          searchTerm &&
          !loading &&
          !searchError && (
            <Alert className="bg-muted">
              <AlertDescription>
                No foods found matching your search. Try different keywords.
              </AlertDescription>
            </Alert>
          )}
      </CardContent>
    </Card>
  );
};
FoodSearch.propTypes = {
  onFoodSelect: PropTypes.func.isRequired,
  onFoodsImport: PropTypes.func.isRequired,
  selectedFoodIds: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default FoodSearch;
