import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect } from "react";

const knapLetters = ["K", "n", "a", "p"];
const snackLetters = ["[", "S", "n", "a", "c", "k", "]"];

interface BrandLogoProps {
  variant?: "header" | "landing";
}

export default function BrandLogo({ variant = "header" }: BrandLogoProps) {
  const pathLength = useMotionValue(0);

  useEffect(() => {
    animate(pathLength, 1, { duration: 0.9, delay: 1.1, ease: "easeInOut" });
  }, [pathLength]);

  const isLanding = variant === "landing";

  const textClass = isLanding
    ? "text-[17vw] sm:text-[14vw] lg:text-[11vw] text-foreground"
    : "text-xl sm:text-2xl text-white";

  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-[0.02em]">
      <span className="flex items-baseline">
        {knapLetters.map((char, i) => (
          <div key={i} className="overflow-hidden">
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.65,
                delay: 0.1 + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`no-select inline-block font-black leading-[0.85] tracking-tighter ${textClass}`}
            >
              {char}
            </motion.span>
          </div>
        ))}
      </span>

      <span className="relative flex items-baseline overflow-visible">
        {snackLetters.map((char, i) => (
          <div key={i} className="overflow-hidden">
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.65,
                delay: 0.32 + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`no-select inline-block font-black leading-[0.85] tracking-tighter ${textClass}`}
              style={{ color: "var(--accent-highlight)" }}
            >
              {char}
            </motion.span>
          </div>
        ))}

        <svg
          className={`absolute left-0 w-full ${
            isLanding ? "-bottom-[0.75em]" : "-bottom-[0.15em]"
          }`}
          height={isLanding ? "14" : "8"}
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          aria-hidden
        >
          <motion.path
            d="M0,9 Q25,3 50,9 Q75,15 100,9"
            fill="none"
            stroke="var(--accent-highlight)"
            strokeWidth={isLanding ? "2.5" : "3.5"}
            strokeLinecap="round"
            style={{ pathLength, opacity: pathLength }}
          />
        </svg>
      </span>
    </div>
  );
}
