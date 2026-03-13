import { motion } from "framer-motion";

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
}

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
  },
];

function OrbitScene({
  scene,
  index,
}: {
  scene: OrbitSceneData;
  index: number;
}) {
  const isAccent = scene.textColor === "accent";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="relative aspect-square w-full shrink-0 sm:aspect-auto sm:h-[380px] sm:w-[380px]"
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
            color: "var(--orbit-fg)",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {scene.label}
        </div>
      </div>
    </motion.div>
  );
}

export default function DietsSection() {
  return (
    <>
      <section
        id="diets"
        className="relative flex w-full flex-col items-center justify-center overflow-hidden py-16"
      >
        <div className="mx-auto w-full max-w-[1204px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mb-12 px-4 text-center sm:mb-16 sm:px-6 lg:px-8"
          ></motion.div>

          <div className="relative z-10 flex w-full flex-wrap items-center justify-center gap-0 sm:px-6 lg:px-8">
            {scenes.map((scene, i) => (
              <OrbitScene key={scene.id} scene={scene} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
