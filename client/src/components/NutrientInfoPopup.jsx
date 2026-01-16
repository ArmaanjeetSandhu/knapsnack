import { Check, CircleAlert, Info } from "lucide-react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const NUTRIENT_INFO = {
  "Vitamin A": {
    description: "Essential for vision, immune function, and cell growth",
    sources: ["Sweet potatoes", "Carrots", "Spinach", "Eggs"],
    deficiencySymptoms: [
      "Night blindness",
      "Weakened immune system",
      "Poor skin health",
    ],
    toxicitySymptoms: ["Blurred vision", "Bone pain", "Skin irritation"],
    category: "Fat-soluble vitamin",
  },
  "Vitamin C": {
    description: "Important for immune function and collagen synthesis",
    sources: ["Citrus fruits", "Bell peppers", "Broccoli", "Strawberries"],
    deficiencySymptoms: [
      "Weakened immune system",
      "Slow wound healing",
      "Fatigue",
    ],
    toxicitySymptoms: ["Diarrhoea", "Nausea", "Abdominal cramps"],
    category: "Water-soluble vitamin",
  },
  Calcium: {
    description:
      "Important for bone health, muscle function, and nerve signaling",
    sources: ["Dairy products", "Leafy greens", "Fortified foods", "Tofu"],
    deficiencySymptoms: ["Weak bones", "Muscle cramps", "Numbness"],
    toxicitySymptoms: [
      "Kidney stones",
      "Constipation",
      "Interference with other minerals",
    ],
    category: "Mineral",
  },
  Thiamin: {
    description: "Essential for energy metabolism and nerve function",
    sources: ["Fortified cereals", "Pork (lean)", "Whole grains", "Legumes"],
    deficiencySymptoms: [
      "Peripheral neuropathy (burning feet)",
      "Muscle wasting",
      "Edema (Wet Beriberi)",
    ],
    toxicitySymptoms: [
      "No specific toxicity identified",
      "Rapid renal excretion",
    ],
    category: "Water-soluble vitamin",
  },
  Riboflavin: {
    description: "Critical for energy production and cellular function",
    sources: ["Beef liver", "Fortified cereals", "Oats", "Yogurt"],
    deficiencySymptoms: [
      "Cracks at corners of mouth",
      "Swollen/magenta tongue",
      "Eye sensitivity",
    ],
    toxicitySymptoms: ["Harmless yellow urine", "No adverse effects reported"],
    category: "Water-soluble vitamin",
  },
  Niacin: {
    description: "Vital for DNA repair and metabolism of fats/sugars",
    sources: ["Beef liver", "Chicken breast", "Marinara sauce", "Turkey"],
    deficiencySymptoms: ["Rough skin rash", "Diarrhoea", "Dementia"],
    toxicitySymptoms: ["Skin flushing", "Liver damage", "Hypotension"],
    category: "Water-soluble vitamin",
  },
  "Pantothenic Acid": {
    description: "Required for fatty acid synthesis and energy metabolism",
    sources: [
      "Beef liver",
      "Fortified cereals",
      "Shiitake mushrooms",
      "Sunflower seeds",
    ],
    deficiencySymptoms: [
      "Burning feet syndrome",
      "Fatigue",
      "Gastrointestinal disturbances",
    ],
    toxicitySymptoms: [
      "Mild diarrhoea (at very high doses)",
      "No systemic toxicity",
    ],
    category: "Water-soluble vitamin",
  },
  "Vitamin B6": {
    description: "Governs protein metabolism and neurotransmitter synthesis",
    sources: ["Chickpeas", "Beef liver", "Tuna", "Salmon"],
    deficiencySymptoms: [
      "Microcytic anemia",
      "Depression/Confusion",
      "Inflammation of lips/tongue",
    ],
    toxicitySymptoms: [
      "Sensory neuropathy",
      "Loss of coordination",
      "Skin lesions",
    ],
    category: "Water-soluble vitamin",
  },
  Folate: {
    description: "Crucial for DNA synthesis and cell division",
    sources: ["Beef liver", "Spinach", "Black-eyed peas", "Fortified cereals"],
    deficiencySymptoms: [
      "Megaloblastic anemia",
      "Neural tube defects (fetus)",
      "Gastrointestinal issues",
    ],
    toxicitySymptoms: [
      "Masks Vitamin B12 deficiency",
      "Potential immune suppression",
    ],
    category: "Water-soluble vitamin",
  },
  Choline: {
    description:
      "Structural component of cell membranes and supports liver function",
    sources: ["Beef liver", "Eggs", "Beef top round", "Soybeans"],
    deficiencySymptoms: ["Liver damage", "Fatty liver", "Muscle damage"],
    toxicitySymptoms: [
      "Fishy body odour",
      "Low blood pressure",
      "Excessive sweating",
    ],
    category: "Water-soluble nutrient",
  },
  "Vitamin E": {
    description: "Primary antioxidant protecting cell membranes",
    sources: ["Wheat germ oil", "Sunflower seeds", "Almonds", "Vegetable oils"],
    deficiencySymptoms: [
      "Nerve damage",
      "Muscle weakness",
      "Weakened immune system",
    ],
    toxicitySymptoms: ["Increased bleeding risk", "Hemorrhagic stroke risk"],
    category: "Fat-soluble vitamin",
  },
  "Vitamin K": {
    description: "Essential for blood clotting and bone health",
    sources: ["Natto", "Collards", "Turnip greens", "Spinach"],
    deficiencySymptoms: [
      "Defective blood clotting",
      "Easy bruising",
      "Bone fractures",
    ],
    toxicitySymptoms: [
      "Liver damage (synthetic forms)",
      "Interference with blood thinners",
    ],
    category: "Fat-soluble vitamin",
  },
  Sodium: {
    description: "Regulates fluid balance and nerve transmission",
    sources: ["Breads and rolls", "Pizza", "Cured meats", "Soups"],
    deficiencySymptoms: ["Headache", "Confusion", "Seizures"],
    toxicitySymptoms: [
      "High blood pressure",
      "Fluid retention",
      "Kidney stones",
    ],
    category: "Mineral",
  },
  Magnesium: {
    description: "Cofactor for over 300 enzyme systems and muscle function",
    sources: ["Pumpkin seeds", "Chia seeds", "Almonds", "Spinach"],
    deficiencySymptoms: ["Muscle tremors/cramps", "Arrhythmias", "Fatigue"],
    toxicitySymptoms: ["Diarrhoea", "Muscle weakness", "Cardiac arrest"],
    category: "Mineral",
  },
  Phosphorus: {
    description: "Structural component of bones, DNA, and ATP",
    sources: ["Yogurt", "Milk", "Salmon", "Scallops"],
    deficiencySymptoms: ["Muscle weakness", "Bone pain", "Confusion"],
    toxicitySymptoms: ["Calcium deposits in tissues", "Bone damage"],
    category: "Mineral",
  },
  Potassium: {
    description: "Maintains nerve transmission and muscle contraction",
    sources: ["Dried apricots", "Lentils", "Squash", "Prunes"],
    deficiencySymptoms: [
      "Muscle weakness",
      "Constipation",
      "Heart arrhythmias",
    ],
    toxicitySymptoms: ["Cardiac arrest", "Heart palpitations"],
    category: "Mineral",
  },
  Manganese: {
    description: "Antioxidant defense and bone formation",
    sources: ["Whole grains", "Clams", "Hazelnuts", "Legumes"],
    deficiencySymptoms: [
      "Poor bone growth",
      "Skin rash",
      "Impaired glucose tolerance",
    ],
    toxicitySymptoms: [
      "Tremors",
      "Muscle rigidity",
      "Neurological instability",
    ],
    category: "Mineral",
  },
  Iron: {
    description: "Essential for oxygen transport (hemoglobin) and energy",
    sources: ["Fortified cereals", "Oysters", "White beans", "Beef liver"],
    deficiencySymptoms: [
      "Microcytic anemia",
      "Extreme fatigue",
      "Pale skin/Weakness",
    ],
    toxicitySymptoms: ["Vomiting", "Organ failure", "Liver cirrhosis"],
    category: "Mineral",
  },
  Zinc: {
    description: "Critical for immune function, DNA synthesis, and healing",
    sources: ["Oysters", "Beef", "Blue crab", "Pumpkin seeds"],
    deficiencySymptoms: ["Stunted growth", "Hair loss", "Loss of taste"],
    toxicitySymptoms: ["Copper deficiency", "Lowered immune function"],
    category: "Mineral",
  },
  Selenium: {
    description: "Antioxidant defense and thyroid hormone activation",
    sources: ["Brazil nuts", "Tuna", "Sardines", "Shrimp"],
    deficiencySymptoms: [
      "Heart damage (Keshan disease)",
      "Joint pain",
      "Hypothyroidism",
    ],
    toxicitySymptoms: [
      "Hair/nail loss",
      "Garlic breath",
      "Nervous system abnormalities",
    ],
    category: "Mineral",
  },
};

const NutrientInfoPopup = ({ isOpen, onClose, nutrient, rda, ul, unit }) => {
  const nutrientName = nutrient.split(" (")[0];
  const info = NUTRIENT_INFO[nutrientName];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {nutrientName}
                <span className="text-sm text-muted-foreground">
                  {info.category}
                </span>
              </DialogTitle>
              <DialogDescription className="mt-2">
                {info.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
                <h3 className="font-semibold">Recommended Daily Allowance</h3>
              </div>
              <p className="text-2xl font-bold">
                {rda?.toLocaleString()} {unit}
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-2 mb-2 text-yellow-600 dark:text-yellow-400">
                <CircleAlert className="h-5 w-5" />
                <h3 className="font-semibold">Tolerable Upper Intake Level</h3>
              </div>
              <p className="text-2xl font-bold">
                {ul ? ul.toLocaleString() : "Not established"} {ul ? unit : ""}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Common Food Sources</h3>
            <div className="grid gap-2">
              {info.sources.map((source, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-card flex items-center gap-3"
                >
                  <Info className="h-4 w-4 text-blue-500" />
                  {source}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-600 dark:text-yellow-400">
                Deficiency Symptoms
              </h3>
              <ul className="space-y-2">
                {info.deficiencySymptoms.map((symptom, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-600 dark:text-red-400">
                Toxicity Symptoms
              </h3>
              <ul className="space-y-2">
                {info.toxicitySymptoms.map((symptom, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {symptom}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

NutrientInfoPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  nutrient: PropTypes.string.isRequired,
  rda: PropTypes.number,
  ul: PropTypes.number,
  unit: PropTypes.string.isRequired,
};

export default NutrientInfoPopup;
