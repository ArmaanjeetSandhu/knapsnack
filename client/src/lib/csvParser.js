export const processCSVData = (results) => {
  if (results.errors.length > 0) {
    return {
      success: false,
      error:
        "Error parsing CSV file. Please ensure the file format is correct.",
    };
  }

  try {
    const importedFoods = results.data.map((row, index) => {
      const servingSize = row["Serving Size (g)"] || 100;
      const normalizedNutrients = {
        "Vitamin A (µg)": (row["Vitamin A (µg)"] * 100) / servingSize,
        "Vitamin C (mg)": (row["Vitamin C (mg)"] * 100) / servingSize,
        "Vitamin E (mg)": (row["Vitamin E (mg)"] * 100) / servingSize,
        "Vitamin K (µg)": (row["Vitamin K (µg)"] * 100) / servingSize,
        "Thiamin (mg)":
          ((row["Thiamin (Vitamin B₁) (mg)"] || row["Thiamin (mg)"]) * 100) /
          servingSize,
        "Riboflavin (mg)":
          ((row["Riboflavin (Vitamin B₂) (mg)"] || row["Riboflavin (mg)"]) *
            100) /
          servingSize,
        "Niacin (mg)":
          ((row["Niacin (Vitamin B₃) (mg)"] || row["Niacin (mg)"]) * 100) /
          servingSize,
        "Vitamin B6 (mg)": (row["Vitamin B6 (mg)"] * 100) / servingSize,
        "Folate (µg)":
          ((row["Folate (Vitamin B₉) (µg)"] || row["Folate (µg)"]) * 100) /
          servingSize,
        "Calcium (mg)": (row["Calcium (mg)"] * 100) / servingSize,
        carbohydrate: (row["Carbohydrate (g)"] * 100) / servingSize,
        "Choline (mg)": (row["Choline (mg)"] * 100) / servingSize,
        protein: (row["Protein (g)"] * 100) / servingSize,
        fats: (row["Fats (g)"] * 100) / servingSize,
        saturated_fats: (row["Saturated Fats (g)"] * 100) / servingSize,
        fibre: (row["Fibre (g)"] * 100) / servingSize,
        "Iron (mg)": (row["Iron (mg)"] * 100) / servingSize,
        "Magnesium (mg)": (row["Magnesium (mg)"] * 100) / servingSize,
        "Manganese (mg)": (row["Manganese (mg)"] * 100) / servingSize,
        "Phosphorus (mg)": (row["Phosphorus (mg)"] * 100) / servingSize,
        "Selenium (µg)": (row["Selenium (µg)"] * 100) / servingSize,
        "Zinc (mg)": (row["Zinc (mg)"] * 100) / servingSize,
        "Potassium (mg)": (row["Potassium (mg)"] * 100) / servingSize,
        "Sodium (mg)": (row["Sodium (mg)"] * 100) / servingSize,
        "Pantothenic Acid (mg)":
          ((row["Pantothenic Acid (Vitamin B₅) (mg)"] ||
            row["Pantothenic Acid (mg)"]) *
            100) /
          servingSize,
        "Water (mL)": (row["Water (mL)"] * 100) / servingSize,
      };

      return {
        fdcId: row["FDC ID"]
          ? row["FDC ID"].toString()
          : `imported-${Date.now()}-${index}`,
        description: row["Food Item"],
        price: row["Price"],
        servingSize: row["Serving Size (g)"],
        maxServing: row["Max Serving (g)"],
        integerServings: row["Discrete Servings"] === "Yes",
        nutrients: normalizedNutrients,
      };
    });
    return { success: true, data: importedFoods };
  } catch {
    return {
      success: false,
      error:
        "Invalid CSV format. Please use a CSV file exported from this application.",
    };
  }
};
