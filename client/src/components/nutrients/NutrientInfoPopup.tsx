import { Check, CircleAlert, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface NutrientInfo {
  description: string;
  sources: string[];
  deficiencySymptoms: string[];
  toxicitySymptoms: string[];
  category: string;
  displayName?: string;
}

const NUTRIENT_INFO: Record<string, NutrientInfo> = {
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
    category: "Macromineral",
  },
  Thiamin: {
    displayName: "Thiamin (Vitamin B₁)",
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
    displayName: "Riboflavin (Vitamin B₂)",
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
    displayName: "Niacin (Vitamin B₃)",
    description: "Vital for DNA repair and metabolism of fats/sugars",
    sources: ["Beef liver", "Chicken breast", "Marinara sauce", "Turkey"],
    deficiencySymptoms: ["Rough skin rash", "Diarrhoea", "Dementia"],
    toxicitySymptoms: ["Skin flushing", "Liver damage", "Hypotension"],
    category: "Water-soluble vitamin",
  },
  "Pantothenic Acid": {
    displayName: "Pantothenic Acid (Vitamin B₅)",
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
  "Vitamin B₆": {
    description: "Governs protein metabolism and neurotransmitter synthesis",
    sources: ["Chickpeas", "Beef liver", "Tuna", "Salmon"],
    deficiencySymptoms: [
      "Microcytic anaemia",
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
    displayName: "Folate (Vitamin B₉)",
    description: "Crucial for DNA synthesis and cell division",
    sources: ["Beef liver", "Spinach", "Black-eyed peas", "Fortified cereals"],
    deficiencySymptoms: [
      "Megaloblastic anaemia",
      "Neural tube defects (foetus)",
      "Gastrointestinal issues",
    ],
    toxicitySymptoms: [
      "Masks Vitamin B₁₂ deficiency",
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
    toxicitySymptoms: ["Increased bleeding risk", "Haemorrhagic stroke risk"],
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
    category: "Macromineral",
  },
  Magnesium: {
    description: "Cofactor for over 300 enzyme systems and muscle function",
    sources: ["Pumpkin seeds", "Chia seeds", "Almonds", "Spinach"],
    deficiencySymptoms: ["Muscle tremors/cramps", "Arrhythmias", "Fatigue"],
    toxicitySymptoms: ["Diarrhoea", "Muscle weakness", "Cardiac arrest"],
    category: "Macromineral",
  },
  Phosphorus: {
    description: "Structural component of bones, DNA, and ATP",
    sources: ["Yogurt", "Milk", "Salmon", "Scallops"],
    deficiencySymptoms: ["Muscle weakness", "Bone pain", "Confusion"],
    toxicitySymptoms: ["Calcium deposits in tissues", "Bone damage"],
    category: "Macromineral",
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
    category: "Macromineral",
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
    category: "Trace mineral",
  },
  Iron: {
    description: "Essential for oxygen transport (haemoglobin) and energy",
    sources: ["Fortified cereals", "Oysters", "White beans", "Beef liver"],
    deficiencySymptoms: [
      "Microcytic anaemia",
      "Extreme fatigue",
      "Pale skin/Weakness",
    ],
    toxicitySymptoms: ["Vomiting", "Organ failure", "Liver cirrhosis"],
    category: "Trace mineral",
  },
  Zinc: {
    description: "Critical for immune function, DNA synthesis, and healing",
    sources: ["Oysters", "Beef", "Blue crab", "Pumpkin seeds"],
    deficiencySymptoms: ["Stunted growth", "Hair loss", "Loss of taste"],
    toxicitySymptoms: ["Copper deficiency", "Lowered immune function"],
    category: "Trace mineral",
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
    category: "Trace mineral",
  },
};

interface SymptomListProps {
  title: string;
  symptoms: string[];
  headerClassName: string;
  dotClassName: string;
}

const SymptomList = ({
  title,
  symptoms,
  headerClassName,
  dotClassName,
}: SymptomListProps) => (
  <div>
    <h3 className={`mb-3 text-lg font-semibold ${headerClassName}`}>{title}</h3>
    <ul className="space-y-2">
      {symptoms.map((symptom, index) => (
        <li key={index} className="flex items-center gap-2 text-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />
          {symptom}
        </li>
      ))}
    </ul>
  </div>
);

interface NutrientInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  nutrient: string;
  rda?: number;
  ul?: number;
  unit: string;
  amount?: number;
}

const NutrientInfoPopup = ({
  isOpen,
  onClose,
  nutrient,
  rda,
  ul,
  unit,
}: NutrientInfoPopupProps) => {
  const nutrientName = nutrient.split(" (")[0];
  const info = NUTRIENT_INFO[nutrientName];

  if (!info) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-left text-2xl">
                {info.displayName ?? nutrientName}
              </DialogTitle>
              <span className="mt-1 block text-left text-sm font-medium leading-tight text-muted-foreground">
                {info.category}
              </span>
              <DialogDescription className="mt-2 text-left">
                {info.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="h-5 w-5" />
                <h3 className="font-semibold">Recommended Daily Allowance</h3>
              </div>
              <p className="text-2xl font-bold">
                {rda?.toLocaleString()} {unit}
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <CircleAlert className="h-5 w-5" />
                <h3 className="font-semibold">Tolerable Upper Intake Level</h3>
              </div>
              <p className="text-2xl font-bold">
                {ul ? ul.toLocaleString() : "Not established"} {ul ? unit : ""}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold">Common Food Sources</h3>
            <div className="grid gap-2">
              {info.sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <Info className="h-4 w-4 text-blue-500" />
                  {source}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SymptomList
              title="Deficiency Symptoms"
              symptoms={info.deficiencySymptoms}
              headerClassName="text-yellow-600 dark:text-yellow-400"
              dotClassName="bg-yellow-500"
            />
            <SymptomList
              title="Toxicity Symptoms"
              symptoms={info.toxicitySymptoms}
              headerClassName="text-red-600 dark:text-red-400"
              dotClassName="bg-red-500"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NutrientInfoPopup;
