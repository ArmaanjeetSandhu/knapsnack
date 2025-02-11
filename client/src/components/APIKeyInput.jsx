import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Key, ExternalLink } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

const APIKeyInput = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const savedApiKey = localStorage.getItem('usda_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeySubmit(savedApiKey);
    }
  }, [onApiKeySubmit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    
    localStorage.setItem('usda_api_key', apiKey);
    onApiKeySubmit(apiKey);
    setError(null);
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary">
        <CardTitle className="text-white flex items-center gap-2">
          <Key className="w-5 h-5" />
          USDA API Key Required
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please enter your USDA FoodData Central API key. You can get one for free at:
            </p>
            <a
              href="https://fdc.nal.usda.gov/api-key-signup.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              fdc.nal.usda.gov/api-key-signup.html
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your USDA API key"
              className="flex-1"
            />
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
APIKeyInput.propTypes = {
  onApiKeySubmit: PropTypes.func.isRequired,
};

export default APIKeyInput;