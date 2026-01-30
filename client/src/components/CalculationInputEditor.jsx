import { GenderFemaleIcon, GenderMaleIcon } from "@phosphor-icons/react";
import {
  Calendar,
  Cigarette,
  CigaretteOff,
  Heart,
  Ruler,
  Scale,
  Utensils,
  Weight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

const AMDR = {
  protein: { min: 10, max: 40 },
  carbs: { min: 40, max: 65 },
  fat: { min: 20, max: 35 },
};

const quantize = (x) => Math.round(x / 5) * 5;

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

function updateMacros({ mode, intent, protein, carbs }) {
  const fat = 100 - protein - carbs;

  if (mode === "PROTEIN_CARB") {
    const available = 100 - fat;

    let newProtein = clamp(intent, 0, available);
    let newCarbs = available - newProtein;

    newProtein = clamp(newProtein, AMDR.protein.min, AMDR.protein.max);
    newCarbs = available - newProtein;

    if (newCarbs < AMDR.carbs.min) {
      newCarbs = AMDR.carbs.min;
      newProtein = available - newCarbs;
    }
    if (newCarbs > AMDR.carbs.max) {
      newCarbs = AMDR.carbs.max;
      newProtein = available - newCarbs;
    }

    return { protein: newProtein, carbs: newCarbs };
  }

  if (mode === "CARB_FAT") {
    const available = 100 - protein;

    let proteinPlusCarbs = clamp(intent, protein, 100);
    let newCarbs = proteinPlusCarbs - protein;
    let newFat = available - newCarbs;

    newCarbs = clamp(newCarbs, AMDR.carbs.min, AMDR.carbs.max);
    newFat = available - newCarbs;

    if (newFat < AMDR.fat.min) {
      newFat = AMDR.fat.min;
      newCarbs = available - newFat;
    }
    if (newFat > AMDR.fat.max) {
      newFat = AMDR.fat.max;
      newCarbs = available - newFat;
    }

    return { protein, carbs: newCarbs };
  }

  return { protein, carbs };
}

const ActivitySlider = ({ value, onChange, autoFocus }) => {
  const inputRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setIsAnimating(true);
  };
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);
  const progress = ((value - 1.2) / (2.4 - 1.2)) * 100;
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
      <div className="flex items-center space-x-2 w-full md:w-[210px] shrink-0">
        <Heart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Activity Level
        </h3>
      </div>
      <div className="flex-1 flex items-center gap-4 w-full">
        <div className="flex-1 relative group">
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 transition-all duration-200">
            <div
              className="h-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          <input
            ref={inputRef}
            type="range"
            min="1.2"
            max="2.4"
            step="0.1"
            value={value}
            onChange={handleChange}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-[80px] shrink-0 text-right whitespace-nowrap">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

const CalorieTargetSlider = ({ value, onChange, autoFocus }) => {
  const inputRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setIsAnimating(true);
  };
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);
  const progress = ((value - 75) / (125 - 75)) * 100;
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
      <div className="flex items-center space-x-2 w-full md:w-[210px] shrink-0">
        <Scale className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Target Caloric Intake
        </h3>
      </div>
      <div className="flex-1 flex items-center gap-4 w-full">
        <div className="flex-1 relative group">
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 transition-all duration-200">
            <div
              className="h-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          <input
            ref={inputRef}
            type="range"
            min="75"
            max="125"
            step="5"
            value={value}
            onChange={handleChange}
            className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-[80px] shrink-0 text-right whitespace-nowrap">
          {value}%
        </span>
      </div>
    </div>
  );
};

export default function CalculationInputEditor({
  initialData,
  onSave,
  onCancel,
}) {
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [activity, setActivity] = useState(1.4);
  const [smoker, setSmoker] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(100);

  const [protein, setProtein] = useState(30);
  const [carbs, setCarbs] = useState(45);

  useEffect(() => {
    if (initialData) {
      setGender(initialData.gender === "m" ? "male" : "female");
      setAge(initialData.age || 30);
      setWeight(initialData.weight || 70);
      setHeight(initialData.height || 175);
      setActivity(initialData.activity || 1.4);
      setSmoker(initialData.smokingStatus === "yes");
      setCalorieTarget(initialData.percentage || 100);
      setProtein(initialData.macroRatios?.protein || 30);
      setCarbs(initialData.macroRatios?.carbohydrate || 45);
    }
  }, [initialData]);

  const fat = 100 - protein - carbs;

  const dragMode = useRef(null);
  const trackRef = useRef(null);

  function pointerToIntent(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX ?? e.touches[0].clientX;
    const raw = ((x - rect.left) / rect.width) * 100;
    return quantize(clamp(raw, 0, 100));
  }

  function handlePointerMove(e) {
    if (!dragMode.current) return;
    const intent = pointerToIntent(e);
    const result = updateMacros({
      mode: dragMode.current,
      intent,
      protein,
      carbs,
    });
    setProtein(result.protein);
    setCarbs(result.carbs);
  }

  function stopDrag() {
    dragMode.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDrag);
    window.removeEventListener("pointercancel", stopDrag);
  }

  function startDrag(mode, e) {
    e.preventDefault();
    dragMode.current = mode;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  }

  function handleKeyDown(e, mode) {
    let delta = 0;
    if (e.key === "ArrowLeft") delta = -5;
    if (e.key === "ArrowRight") delta = 5;

    if (delta === 0) return;

    e.preventDefault();

    const currentIntent = mode === "PROTEIN_CARB" ? protein : protein + carbs;
    const intent = currentIntent + delta;

    const result = updateMacros({
      mode,
      intent,
      protein,
      carbs,
    });

    setProtein(result.protein);
    setCarbs(result.carbs);
  }

  const handleSave = () => {
    const formData = {
      gender: gender === "male" ? "m" : "f",
      age,
      weight,
      height,
      activity,
      percentage: calorieTarget,
      macroRatios: {
        protein,
        carbohydrate: carbs,
        fats: fat,
      },
      smokingStatus: smoker ? "yes" : "no",
    };
    onSave(formData);
  };

  return (
    <div className="space-y-6 select-none p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div
            onClick={() => setGender("male")}
            className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex cursor-pointer select-none"
          >
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-600 rounded-full shadow-sm transition-all duration-300 ${
                gender === "male" ? "left-1" : "left-[50%]"
              }`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGender("male");
              }}
              className={`flex-1 z-10 flex items-center justify-center gap-2 transition-colors duration-300 rounded-full ${
                gender === "male"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <GenderMaleIcon
                weight={gender === "male" ? "bold" : "regular"}
                className="w-5 h-5"
              />
              <span className="font-medium">Male</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setGender("female");
              }}
              className={`flex-1 z-10 flex items-center justify-center gap-2 transition-colors duration-300 rounded-full ${
                gender === "female"
                  ? "text-pink-600 dark:text-pink-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <GenderFemaleIcon
                weight={gender === "female" ? "bold" : "regular"}
                className="w-5 h-5"
              />
              <span className="font-medium">Female</span>
            </button>
          </div>
        </div>

        <div className="flex-1">
          <div
            onClick={() => setSmoker(false)}
            className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex cursor-pointer select-none"
          >
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-600 rounded-full shadow-sm transition-all duration-300 ${
                !smoker ? "left-1" : "left-[50%]"
              }`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSmoker(false);
              }}
              className={`flex-1 z-10 flex items-center justify-center gap-2 transition-colors duration-300 rounded-full ${
                !smoker
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <CigaretteOff className="w-5 h-5" />
              <span className="font-medium">No</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSmoker(true);
              }}
              className={`flex-1 z-10 flex items-center justify-center gap-2 transition-colors duration-300 rounded-full ${
                smoker
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              <Cigarette className="w-5 h-5" />
              <span className="font-medium">Yes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="flex items-center space-x-2 w-[210px] shrink-0">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Age
          </h3>
        </div>
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 relative group">
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 transition-all duration-200">
              <div
                className="h-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 rounded-full"
                style={{ width: `${((age - 19) / (100 - 19)) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={19}
              max={100}
              step={1}
              value={age}
              onChange={(e) => setAge(+e.target.value)}
              className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-[80px] shrink-0 text-right whitespace-nowrap">
            {age} years
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="flex items-center space-x-2 w-[210px] shrink-0">
          <Weight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Weight
          </h3>
        </div>
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 relative group">
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 transition-all duration-200">
              <div
                className="h-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 rounded-full"
                style={{ width: `${((weight - 30) / (200 - 30)) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={30}
              max={200}
              step={1}
              value={weight}
              onChange={(e) => setWeight(+e.target.value)}
              className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-[80px] shrink-0 text-right whitespace-nowrap">
            {weight} kg
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
        <div className="flex items-center space-x-2 w-[210px] shrink-0">
          <Ruler className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Height
          </h3>
        </div>
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 relative group">
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 transition-all duration-200">
              <div
                className="h-full bg-gray-600 dark:bg-gray-400 transition-all duration-300 rounded-full"
                style={{ width: `${((height - 135) / (200 - 135)) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={135}
              max={200}
              step={1}
              value={height}
              onChange={(e) => setHeight(+e.target.value)}
              className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-[80px] shrink-0 text-right whitespace-nowrap">
            {height} cm
          </span>
        </div>
      </div>

      <ActivitySlider value={activity} onChange={setActivity} />

      <CalorieTargetSlider value={calorieTarget} onChange={setCalorieTarget} />

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Utensils className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Macronutrient Distribution
          </h3>
        </div>

        <div
          ref={trackRef}
          className="relative h-14 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer shadow-inner select-none"
        >
          <div
            className="absolute h-full bg-[#5A7ACD] dark:bg-[#234C6A] rounded-l-full transition-all duration-100 flex items-center justify-center overflow-hidden"
            style={{ width: `${protein}%` }}
          >
            <span className="text-white font-bold text-xs select-none whitespace-nowrap">
              P : {protein}%
            </span>
          </div>

          <div
            className="absolute h-full bg-[#FEB05D] dark:bg-[#456882] transition-all duration-100 flex items-center justify-center overflow-hidden"
            style={{
              left: `${protein}%`,
              width: `${carbs}%`,
            }}
          >
            <span className="text-white font-bold text-xs select-none whitespace-nowrap">
              C : {carbs}%
            </span>
          </div>

          <div
            className="absolute h-full bg-[#F5F2F2] dark:bg-[#D2C1B6] rounded-r-full transition-all duration-100 flex items-center justify-center overflow-hidden"
            style={{
              left: `${protein + carbs}%`,
              width: `${fat}%`,
            }}
          >
            <span className="text-gray-900 font-bold text-xs select-none whitespace-nowrap">
              F : {fat}%
            </span>
          </div>

          <div
            className="absolute top-[-2px] w-8 h-[60px] rounded cursor-grab active:cursor-grabbing z-10 select-none flex items-center justify-center outline-none group"
            style={{ left: `calc(${protein}% - 16px)` }}
            onPointerDown={(e) => startDrag("PROTEIN_CARB", e)}
            tabIndex={0}
            role="slider"
            aria-label="Protein to Carbohydrate Ratio"
            aria-valuemin={AMDR.protein.min}
            aria-valuemax={AMDR.protein.max}
            aria-valuenow={protein}
            onKeyDown={(e) => handleKeyDown(e, "PROTEIN_CARB")}
          >
            <div className="w-1.5 h-12 bg-white dark:bg-gray-100 ring-2 ring-blue-500 rounded-full opacity-0 group-focus:opacity-100 shadow-xl transition-all" />
          </div>

          <div
            className="absolute top-[-2px] w-8 h-[60px] rounded cursor-grab active:cursor-grabbing z-10 select-none flex items-center justify-center outline-none group"
            style={{
              left: `calc(${protein + carbs}% - 16px)`,
            }}
            onPointerDown={(e) => startDrag("CARB_FAT", e)}
            tabIndex={0}
            role="slider"
            aria-label="Carbohydrate to Fat Ratio"
            aria-valuemin={AMDR.carbs.min}
            aria-valuemax={AMDR.carbs.max}
            aria-valuenow={protein + carbs}
            onKeyDown={(e) => handleKeyDown(e, "CARB_FAT")}
          >
            <div className="w-1.5 h-12 bg-white dark:bg-gray-100 ring-2 ring-blue-500 rounded-full opacity-0 group-focus:opacity-100 shadow-xl transition-all" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Confirm</Button>
      </div>
    </div>
  );
}
