import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface OrbitSceneData {
  id: string;
  label: string;
  pathId: string;
  diets: string;
  textColor: string;
  letterSpacing: string;
  animDuration: string;
  animDirection?: string;
  labelDelay?: number;
  nestedLabel?: string;
  nestedClassName: string;
  nestedIndex: number;
}

const NESTED_MIN_WIDTH = 808;
const NESTED_MAX_WIDTH = 1204;

const scenes: OrbitSceneData[] = [
  {
    id: "ticks1",
    label: "SUPPORTS",
    pathId: "cp1",
    diets:
      "✦ VEGAN · VEGETARIAN · PESCATARIAN · INTERMITTENT FASTING · LOW-FODMAP ✦",
    textColor: "currentColor",
    letterSpacing: "5.2",
    animDuration: "18s",
    labelDelay: 0,
    nestedLabel: "SUPPORTED",
    nestedClassName:
      "@min-[808px]:@max-[1204px]:order-3 @min-[808px]:@max-[1204px]:mt-[calc((sqrt(3)-2)*190px)]",
    nestedIndex: 2,
  },
  {
    id: "ticks2",
    label: "ALL",
    pathId: "cp2",
    diets:
      "✦ KETOGENIC · PALEOLITHIC · VOLUMETRICS · LOW-CARB · ATKINS · PORTFOLIO ✦",
    textColor: "accent",
    letterSpacing: "4.4",
    animDuration: "16s",
    animDirection: "reverse",
    labelDelay: 0.15,
    nestedClassName:
      "@min-[808px]:@max-[1204px]:order-1 @min-[808px]:@max-[1204px]:mx-[calc((100%-380px)/2)]",
    nestedIndex: 0,
  },
  {
    id: "ticks3",
    label: "DIETS",
    pathId: "cp3",
    diets:
      "✦ MEDITERRANEAN · DASH · GLUTEN-FREE · TLC · FLEXITARIAN · OKINAWAN · NORDIC ✦",
    textColor: "currentColor",
    letterSpacing: "3.8",
    animDuration: "20s",
    labelDelay: 0.3,
    nestedClassName:
      "@min-[808px]:@max-[1204px]:order-2 @min-[808px]:@max-[1204px]:mt-[calc((sqrt(3)-2)*190px)]",
    nestedIndex: 1,
  },
];

function useIsNested() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNested, setIsNested] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setIsNested(width >= NESTED_MIN_WIDTH && width < NESTED_MAX_WIDTH);
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  return { containerRef, isNested };
}

function OrbitScene({
  scene,
  index,
  isNested,
}: {
  readonly scene: OrbitSceneData;
  readonly index: number;
  readonly isNested: boolean;
}) {
  const order = isNested ? scene.nestedIndex : index;

  const isAccent = scene.textColor === "accent";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: order * 0.15, ease: "easeOut" }}
      className={`relative aspect-square w-full shrink-0 @min-[808px]:aspect-auto @min-[808px]:h-[380px] @min-[808px]:w-[380px] ${scene.nestedClassName}`}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1px solid var(--orbit-ring)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: `orbitSpin ${scene.animDuration} linear infinite`,
          animationDirection: scene.animDirection ?? "normal",
        }}
      >
        <svg
          viewBox="0 0 380 380"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <path
              id={scene.pathId}
              d="M 190,190 m -165,0 a 165,165 0 1,1 330,0 a 165,165 0 1,1 -330,0"
            />
          </defs>
          <text
            className="no-select"
            fontFamily="'DM Mono', monospace"
            fontSize="14"
            fill={isAccent ? "var(--orbit-accent-diets)" : "var(--orbit-fg)"}
            letterSpacing={scene.letterSpacing}
            fontWeight="900"
          >
            <textPath href={`#${scene.pathId}`}>{scene.diets}</textPath>
          </text>
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          className="no-select"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.5rem, 8vw, 3rem)",
            letterSpacing: "0.12em",
            paddingLeft: "0.12em",
            paddingTop: "0.1em",
            color: "var(--orbit-fg)",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {scene.nestedLabel ? (
            <>
              <span className="@min-[808px]:@max-[1204px]:hidden">
                {scene.label}
              </span>
              <span className="hidden @min-[808px]:@max-[1204px]:inline">
                {scene.nestedLabel}
              </span>
            </>
          ) : (
            scene.label
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DietsSection() {
  const { containerRef, isNested } = useIsNested();

  return (
    <section
      id="diets"
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-16"
    >
      <div
        ref={containerRef}
        className="@container mx-auto w-full max-w-[1204px]"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 mb-12 px-4 text-center sm:mb-16 sm:px-6 lg:px-8"
        ></motion.div>

        <div className="relative z-10 flex w-full flex-wrap items-center justify-center gap-0 @min-[808px]:px-6 @min-[1024px]:px-8">
          {scenes.map((scene, i) => (
            <OrbitScene
              key={scene.id}
              scene={scene}
              index={i}
              isNested={isNested}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
