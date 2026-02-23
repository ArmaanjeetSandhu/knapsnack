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
import type { UserInfo } from "../../services/api";

const quantize = (x: number): number => Math.round(x / 5) * 5;
const clamp = (x: number, min: number, max: number): number =>
  Math.min(Math.max(x, min), max);

type DragMode = "PROTEIN_CARB" | "CARB_FAT";

interface MacroUpdateParams {
  mode: DragMode;
  intent: number;
  protein: number;
  carbs: number;
}

function updateMacros({ mode, intent, protein, carbs }: MacroUpdateParams): {
  protein: number;
  carbs: number;
} {
  const fat = 100 - protein - carbs;

  if (mode === "PROTEIN_CARB") {
    const available = 100 - fat;
    const newProtein = clamp(intent, 0, available);
    return { protein: newProtein, carbs: available - newProtein };
  }

  if (mode === "CARB_FAT") {
    const proteinPlusCarbs = clamp(intent, protein, 100);
    return { protein, carbs: proteinPlusCarbs - protein };
  }

  return { protein, carbs };
}

interface SimpleSliderProps {
  value: number;
  onChange: (value: number) => void;
  autoFocus?: boolean;
}

const ActivitySlider = ({ value, onChange, autoFocus }: SimpleSliderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const progress = ((value - 1.2) / (2.4 - 1.2)) * 100;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
      <div className="flex w-full shrink-0 items-center space-x-2 md:w-[210px]">
        <Heart className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Activity Level
        </h3>
      </div>
      <div className="flex w-full flex-1 items-center gap-4">
        <div className="group relative flex-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner transition-all duration-200 group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gray-600 transition-all duration-300 dark:bg-gray-400"
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
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 h-3 w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="w-[80px] shrink-0 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

const CalorieTargetSlider = ({
  value,
  onChange,
  autoFocus,
}: SimpleSliderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const progress = ((value - 75) / (125 - 75)) * 100;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
      <div className="flex w-full shrink-0 items-center space-x-2 md:w-[210px]">
        <Scale className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Target Caloric Intake
        </h3>
      </div>
      <div className="flex w-full flex-1 items-center gap-4">
        <div className="group relative flex-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner transition-all duration-200 group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gray-600 transition-all duration-300 dark:bg-gray-400"
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
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 h-3 w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="w-[80px] shrink-0 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
          {value}%
        </span>
      </div>
    </div>
  );
};

interface CalculationInputEditorProps {
  initialData: UserInfo | null;
  onSave: (data: UserInfo) => void;
  onCancel: () => void;
}

export default function CalculationInputEditor({
  initialData,
  onSave,
  onCancel,
}: CalculationInputEditorProps) {
  const [gender, setGender] = useState<"male" | "female">(
    initialData?.gender === "m" ? "male" : "female",
  );
  const [age, setAge] = useState(initialData?.age ?? 30);
  const [weight, setWeight] = useState(initialData?.weight ?? 70);
  const [height, setHeight] = useState(initialData?.height ?? 175);
  const [activity, setActivity] = useState(initialData?.activity ?? 1.4);
  const [smoker, setSmoker] = useState(initialData?.smokingStatus === "yes");
  const [calorieTarget, setCalorieTarget] = useState(
    initialData?.percentage ?? 100,
  );
  const [protein, setProtein] = useState(
    initialData?.macroRatios?.protein ?? 30,
  );
  const [carbs, setCarbs] = useState(
    initialData?.macroRatios?.carbohydrate ?? 45,
  );

  const fat = 100 - protein - carbs;
  const dragMode = useRef<DragMode | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  function pointerToIntent(e: PointerEvent): number {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX;
    const raw = ((x - rect.left) / rect.width) * 100;
    return quantize(clamp(raw, 0, 100));
  }

  function handlePointerMove(e: PointerEvent) {
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

  function startDrag(mode: DragMode, e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).focus();
    dragMode.current = mode;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  }

  function handleKeyDown(e: React.KeyboardEvent, mode: DragMode) {
    let delta = 0;
    if (e.key === "ArrowLeft") delta = -5;
    if (e.key === "ArrowRight") delta = 5;
    if (delta === 0) return;
    e.preventDefault();
    const currentIntent = mode === "PROTEIN_CARB" ? protein : protein + carbs;
    const result = updateMacros({
      mode,
      intent: currentIntent + delta,
      protein,
      carbs,
    });
    setProtein(result.protein);
    setCarbs(result.carbs);
  }

  const handleSave = () => {
    onSave({
      gender: gender === "male" ? "m" : "f",
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      activity,
      percentage: calorieTarget,
      macroRatios: { protein, carbohydrate: carbs, fats: fat },
      smokingStatus: smoker ? "yes" : "no",
    });
  };

  const isLeftAligned = fat < 10;

  return (
    <div className="no-select space-y-5 p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div
            onClick={() => setGender("male")}
            className="no-select relative flex h-12 w-full cursor-pointer rounded-full bg-gray-100 p-1 dark:bg-gray-800"
          >
            <div
              className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-gray-600 ${
                gender === "male" ? "left-1" : "left-[50%]"
              }`}
            />
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={(e) => {
                  e.stopPropagation();
                  setGender(g);
                }}
                className={`z-10 flex flex-1 items-center justify-center gap-2 rounded-full transition-colors duration-300 ${
                  gender === g
                    ? g === "male"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-pink-600 dark:text-pink-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {g === "male" ? (
                  <GenderMaleIcon
                    weight={gender === "male" ? "bold" : "regular"}
                    className="h-5 w-5"
                  />
                ) : (
                  <GenderFemaleIcon
                    weight={gender === "female" ? "bold" : "regular"}
                    className="h-5 w-5"
                  />
                )}
                <span className="font-medium">
                  {g === "male" ? "Male" : "Female"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div
            onClick={() => setSmoker(false)}
            className="no-select relative flex h-12 w-full cursor-pointer rounded-full bg-gray-100 p-1 dark:bg-gray-800"
          >
            <div
              className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-all duration-300 dark:bg-gray-600 ${
                !smoker ? "left-1" : "left-[50%]"
              }`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSmoker(false);
              }}
              className={`z-10 flex flex-1 items-center justify-center gap-2 rounded-full transition-colors duration-300 ${
                !smoker
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <CigaretteOff className="h-5 w-5" />
              <span className="font-medium">No</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSmoker(true);
              }}
              className={`z-10 flex flex-1 items-center justify-center gap-2 rounded-full transition-colors duration-300 ${
                smoker
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <Cigarette className="h-5 w-5" />
              <span className="font-medium">Yes</span>
            </button>
          </div>
        </div>
      </div>

      <SimpleRangeRow
        icon={<Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
        label="Age"
        value={age}
        min={19}
        max={100}
        step={1}
        onChange={setAge}
        display={`${age} years`}
      />

      <SimpleRangeRow
        icon={<Weight className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
        label="Weight"
        value={weight}
        min={30}
        max={200}
        step={1}
        onChange={setWeight}
        display={`${weight} kg`}
      />

      <SimpleRangeRow
        icon={<Ruler className="h-5 w-5 text-gray-500 dark:text-gray-400" />}
        label="Height"
        value={height}
        min={135}
        max={200}
        step={1}
        onChange={setHeight}
        display={`${height} cm`}
      />

      <ActivitySlider value={activity} onChange={setActivity} />
      <CalorieTargetSlider value={calorieTarget} onChange={setCalorieTarget} />

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Utensils className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Macronutrient Distribution
          </h3>
        </div>

        <div
          ref={trackRef}
          className="relative mb-12 h-14 cursor-pointer rounded-full bg-gray-200 shadow-inner dark:bg-gray-700"
        >
          <MacroSegment
            width={protein}
            left={0}
            colorClass="bg-[#215E61] dark:bg-[#1A3263]"
            isRoundedLeft
            label={`P : ${protein}%`}
            show={protein >= 15}
            externalLeft={`${protein / 2}%`}
            externalOffset={protein < 15 ? "mt-2" : undefined}
          />
          <MacroSegment
            width={carbs}
            left={protein}
            colorClass="bg-[#233D4D] dark:bg-[#547792]"
            label={`C : ${carbs}%`}
            show={carbs >= 15}
            externalLeft={`${protein + carbs / 2}%`}
            externalOffset={
              carbs < 15 ? (protein < 15 ? "mt-8" : "mt-2") : undefined
            }
          />
          <MacroSegment
            width={fat}
            left={protein + carbs}
            colorClass="bg-[#FE7F2D] dark:bg-[#FAB95B]"
            isRoundedRight
            label={`F : ${fat}%`}
            show={fat >= 15}
            externalLeft={`${protein + carbs + fat / 2}%`}
            externalOffset={
              fat < 15
                ? carbs < 15 && protein >= 15
                  ? "mt-8"
                  : "mt-2"
                : undefined
            }
          />

          <div
            className="no-select group absolute top-[-2px] z-10 flex h-[60px] w-8 cursor-grab items-center justify-center rounded outline-none active:cursor-grabbing"
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
            <div className="h-12 w-1.5 rounded-full bg-white shadow-xl ring-0 ring-black transition-all group-focus:ring-2 group-active:ring-2 dark:bg-gray-100" />
          </div>

          <div
            className="no-select group absolute top-[-2px] z-10 flex h-[60px] w-8 cursor-grab items-center justify-center rounded outline-none active:cursor-grabbing"
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
            <div className="h-12 w-1.5 rounded-full bg-white shadow-xl ring-0 ring-black transition-all group-focus:ring-2 group-active:ring-2 dark:bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex w-full">
        <div
          className={`transition-[flex-grow] duration-500 ease-in-out ${isLeftAligned ? "grow-0" : "grow"}`}
        />
        <div className="mt-5 flex shrink-0 gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

interface SimpleRangeRowProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}

function SimpleRangeRow({
  icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: SimpleRangeRowProps) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
      <div className="flex w-[210px] shrink-0 items-center space-x-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </h3>
      </div>
      <div className="flex flex-1 items-center gap-4">
        <div className="group relative flex-1">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner transition-all duration-200 group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gray-600 transition-all duration-300 dark:bg-gray-400"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(+e.target.value)}
            className="absolute inset-0 h-3 w-full cursor-pointer opacity-0"
          />
        </div>
        <span className="w-[80px] shrink-0 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-gray-100">
          {display}
        </span>
      </div>
    </div>
  );
}

interface MacroSegmentProps {
  width: number;
  left: number;
  colorClass: string;
  isRoundedLeft?: boolean;
  isRoundedRight?: boolean;
  label: string;
  show: boolean;
  externalLeft: string;
  externalOffset?: string;
}

function MacroSegment({
  width,
  left,
  colorClass,
  isRoundedLeft,
  isRoundedRight,
  label,
  show,
  externalLeft,
  externalOffset,
}: MacroSegmentProps) {
  return (
    <>
      <div
        className={`absolute h-full ${colorClass} flex items-center justify-center overflow-hidden transition-all duration-100 ${
          isRoundedLeft ? "rounded-l-full" : ""
        } ${isRoundedRight ? "rounded-r-full" : ""}`}
        style={{ left: `${left}%`, width: `${width}%` }}
      >
        {show && (
          <span className="no-select whitespace-nowrap text-xs font-bold text-white">
            {label}
          </span>
        )}
      </div>
      {!show && externalOffset !== undefined && (
        <span
          className={`no-select absolute top-full -translate-x-1/2 whitespace-nowrap text-xs font-bold text-gray-900 dark:text-gray-100 ${externalOffset}`}
          style={{ left: externalLeft }}
        >
          {label}
        </span>
      )}
    </>
  );
}
