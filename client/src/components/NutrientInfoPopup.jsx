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
    toxicitySymptoms: ["Diarrhea", "Nausea", "Abdominal cramps"],
    category: "Water-soluble vitamin",
  },
  "Vitamin D": {
    description: "Critical for bone health and immune system function",
    sources: [
      "Sunlight exposure",
      "Fatty fish",
      "Egg yolks",
      "Fortified foods",
    ],
    deficiencySymptoms: ["Bone pain", "Muscle weakness", "Depression"],
    toxicitySymptoms: [
      "Kidney problems",
      "Calcium buildup in blood",
      "Confusion",
    ],
    category: "Fat-soluble vitamin",
  },
  Iron: {
    description: "Essential for oxygen transport and energy production",
    sources: ["Red meat", "Spinach", "Lentils", "Fortified cereals"],
    deficiencySymptoms: ["Fatigue", "Weakness", "Cold hands and feet"],
    toxicitySymptoms: ["Stomach pain", "Nausea", "Joint pain"],
    category: "Mineral",
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
};
const NutrientInfoPopup = ({ isOpen, onClose, nutrient, rda, ul, unit }) => {
  const nutrientName = nutrient.split(" (")[0]; // Extract name without unit
  const info = NUTRIENT_INFO[nutrientName] || {
    description: "Essential nutrient for human health",
    sources: ["Various whole foods"],
    deficiencySymptoms: ["Consult healthcare provider for specific symptoms"],
    toxicitySymptoms: ["Consult healthcare provider for specific symptoms"],
    category: "Essential nutrient",
  };
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
