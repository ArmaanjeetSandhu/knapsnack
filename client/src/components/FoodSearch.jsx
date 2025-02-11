import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Plus, Key, ExternalLink } from 'lucide-react';
import api from '../services/api';

import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  ScrollArea,
  ScrollBar
} from "../components/ui/scroll-area";

const FoodSearch = ({ onFoodSelect }) => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('usda_api_key') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    localStorage.setItem('usda_api_key', apiKey);
    setError(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (!apiKey.trim()) {
      setError('Please enter your USDA API key first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { results } = await api.searchFood(searchTerm, apiKey);
      setSearchResults(results);
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSelect = (food) => {
    onFoodSelect({
      ...food,
      price: '',
      servingSize: 100,
      maxServing: 500,
    });
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
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
                Get your free API key from{' '}
                <a
                  href="https://fdc.nal.usda.gov/api-key-signup"
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

        <form onSubmit={handleSearch} className="mb-6">
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

        {searchResults.length > 0 && (
          <div className="search-results">
            <h6 className="text-sm font-semibold mb-3">Search Results</h6>
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="divide-y">
                {searchResults.map((food) => (
                  <div
                    key={food.fdcId}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{food.description}</span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleFoodSelect(food)}
                      className="ml-4"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>
        )}

        {searchResults.length === 0 && searchTerm && !loading && !error && (
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
};

export default FoodSearch;