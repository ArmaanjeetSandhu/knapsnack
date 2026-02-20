import Papa from "papaparse";
import { processCSVData } from "../lib/csvParser";

export const useCsvImport = (onImportSuccess, onImportError) => {
  const handleParseComplete = (results) => {
    const result = processCSVData(results);
    if (result.success) onImportSuccess(result.data);
    else if (onImportError) onImportError(result.error);
  };

  const createParseConfig = (errorPrefix) => ({
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: handleParseComplete,
    error: (error) => {
      if (onImportError) onImportError(`${errorPrefix}: ${error.message}`);
    },
  });

  const handleFileDrop = (file) => {
    if (!file) return;
    if (file.type === "text/csv" || file.name.endsWith(".csv"))
      Papa.parse(file, createParseConfig("Error reading file"));
    else if (onImportError) onImportError("Please drop a valid CSV file.");
  };

  return { handleFileDrop, createParseConfig };
};
