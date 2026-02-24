import Papa, { type ParseConfig, type ParseError } from "papaparse";
import { processCSVData, type CsvParseFailure } from "../lib/csvParser";
import type { FoodItem } from "../services/api";

type RawCsvRow = Record<string, string | undefined>;

interface UseCsvImportReturn {
  handleFileDrop: (file: File | null | undefined) => void;
  createParseConfig: (errorPrefix: string) => ParseConfig<RawCsvRow>;
}

export const useCsvImport = (
  onImportSuccess: (foods: FoodItem[]) => void,
  onImportError?: (error: string) => void,
): UseCsvImportReturn => {
  const handleParseComplete = (results: Papa.ParseResult<RawCsvRow>): void => {
    const result = processCSVData(results);
    if (result.success) onImportSuccess(result.data);
    else onImportError?.((result as CsvParseFailure).error);
  };

  const createParseConfig = (errorPrefix: string) => ({
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: handleParseComplete,
    error: (error: ParseError) => {
      onImportError?.(`${errorPrefix}: ${error.message}`);
    },
  });

  const handleFileDrop = (file: File | null | undefined): void => {
    if (!file) return;
    if (file.type === "text/csv" || file.name.endsWith(".csv"))
      Papa.parse<RawCsvRow>(
        file,
        createParseConfig("Error reading file") as any,
      );
    else onImportError?.("Please drop a valid CSV file.");
  };

  return { handleFileDrop, createParseConfig };
};
