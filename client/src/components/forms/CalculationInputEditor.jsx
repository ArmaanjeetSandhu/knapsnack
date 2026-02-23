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
import { Button } from "../ui/button";

const quantize = (x) => Math.round(x / 5) * 5;

const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

function updateMacros({ mode, intent, protein, carbs }) {
  const fat = 100 - protein - carbs;

  if (mode === "PROTEIN_CARB") {
    const available = 100 - fat;
    let newProtein = clamp(intent, 0, available);
    let newCarbs = available - newProtein;
    return { protein: newProtein, carbs: newCarbs };
  }

  if (mode === "CARB_FAT") {
    let proteinPlusCarbs = clamp(intent, protein, 100);
    let newCarbs = proteinPlusCarbs - protein;
    return { protein, carbs: newCarbs };
  }

  return { protein, carbs };
}

const ActivitySlider = ({ value, onChange, autoFocus }) => {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

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

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

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
  const [gender, setGender] = useState(
    initialData?.gender === "m" ? "male" : "female",
  );
  const [age, setAge] = useState(initialData?.age || 30);
  const [weight, setWeight] = useState(initialData?.weight || 70);
  const [height, setHeight] = useState(initialData?.height || 175);
  const [activity, setActivity] = useState(initialData?.activity || 1.4);
  const [smoker, setSmoker] = useState(initialData?.smokingStatus === "yes");
  const [calorieTarget, setCalorieTarget] = useState(
    initialData?.percentage || 100,
  );
  const [protein, setProtein] = useState(
    initialData?.macroRatios?.protein || 30,
  );
  const [carbs, setCarbs] = useState(
    initialData?.macroRatios?.carbohydrate || 45,
  );

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
    e.currentTarget.focus();
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

  const isLeftAligned = fat < 10;

  return (
    <div className="space-y-5 no-select p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div
            onClick={() => setGender("male")}
            className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex cursor-pointer no-select"
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
            className="relative w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex cursor-pointer no-select"
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
          className="relative h-14 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer shadow-inner mb-12"
        >
          <div
            className="absolute h-full bg-[#215E61] dark:bg-[#1A3263] rounded-l-full transition-all duration-100 flex items-center justify-center overflow-hidden"
            style={{ width: `${protein}%` }}
          >
            {protein >= 15 && (
              <span className="text-white font-bold text-xs no-select whitespace-nowrap">
                P : {protein}%
              </span>
            )}
          </div>

          <div
            className="absolute h-full bg-[#233D4D] dark:bg-[#547792] transition-all duration-100 flex items-center justify-center overflow-hidden"
            style={{
              left: `${protein}%`,
              width: `${carbs}%`,
            }}
          >
            {carbs >= 15 && (
              <span className="text-white font-bold text-xs no-select whitespace-nowrap">
                C : {carbs}%
              </span>
            )}
          </div>

          <div
            className="absolute h-full bg-[#FE7F2D] dark:bg-[#FAB95B] rounded-r-full transition-all duration-100 flex items-center justify-center overflow-hidden"
            style={{
              left: `${protein + carbs}%`,
              width: `${fat}%`,
            }}
          >
            {fat >= 15 && (
              <span className="text-white font-bold text-xs no-select whitespace-nowrap">
                F : {fat}%
              </span>
            )}
          </div>

          {protein < 15 && (
            <span
              className="absolute top-full mt-2 text-gray-900 dark:text-gray-100 font-bold text-xs no-select whitespace-nowrap -translate-x-1/2"
              style={{ left: `${protein / 2}%` }}
            >
              P : {protein}%
            </span>
          )}

          {carbs < 15 && (
            <span
              className={`absolute top-full text-gray-900 dark:text-gray-100 font-bold text-xs no-select whitespace-nowrap -translate-x-1/2 ${
                protein < 15 ? "mt-8" : "mt-2"
              }`}
              style={{ left: `${protein + carbs / 2}%` }}
            >
              C : {carbs}%
            </span>
          )}

          {fat < 15 && (
            <span
              className={`absolute top-full text-gray-900 dark:text-gray-100 font-bold text-xs no-select whitespace-nowrap -translate-x-1/2 ${
                carbs < 15 && protein >= 15 ? "mt-8" : "mt-2"
              }`}
              style={{ left: `${protein + carbs + fat / 2}%` }}
            >
              F : {fat}%
            </span>
          )}

          <div
            className="absolute top-[-2px] w-8 h-[60px] rounded cursor-grab active:cursor-grabbing z-10 no-select flex items-center justify-center outline-none group"
            style={{
              left: `calc(${protein}% - 16px - ${carbs === 0 ? 6 : 0}px)`,
            }}
            onPointerDown={(e) => startDrag("PROTEIN_CARB", e)}
            tabIndex={0}
            role="slider"
            aria-label="Protein to Carbohydrate Ratio"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={protein}
            onKeyDown={(e) => handleKeyDown(e, "PROTEIN_CARB")}
          >
            <div className="w-1.5 h-12 bg-white dark:bg-gray-100 ring-0 group-focus:ring-2 group-active:ring-2 ring-black rounded-full shadow-xl transition-all" />
          </div>

          <div
            className="absolute top-[-2px] w-8 h-[60px] rounded cursor-grab active:cursor-grabbing z-10 no-select flex items-center justify-center outline-none group"
            style={{
              left: `calc(${protein + carbs}% - 16px + ${carbs === 0 ? 6 : 0}px)`,
            }}
            onPointerDown={(e) => startDrag("CARB_FAT", e)}
            tabIndex={0}
            role="slider"
            aria-label="Carbohydrate to Fat Ratio"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={protein + carbs}
            onKeyDown={(e) => handleKeyDown(e, "CARB_FAT")}
          >
            <div className="w-1.5 h-12 bg-white dark:bg-gray-100 ring-0 group-focus:ring-2 group-active:ring-2 ring-black rounded-full shadow-xl transition-all" />
          </div>
        </div>
      </div>

      <div className="flex mt-6 w-full">
        <div
          className={`transition-[flex-grow] duration-500 ease-in-out ${
            isLeftAligned ? "grow-0" : "grow"
          }`}
        />
        <div className="flex gap-3 shrink-0 mt-5">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
