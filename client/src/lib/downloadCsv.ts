import Papa from "papaparse";

export const downloadCsv = (
  filename: string,
  fields: string[],
  rows: (string | number)[][],
): void => {
  const csvContent =
    Papa.unparse({ fields, data: rows }, { newline: "\n" }) + "\n";

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
