import { motion } from "framer-motion";

import { cn } from "../../lib/utils";

interface DragHandleProps {
  readonly pulse: boolean;
  readonly className?: string;
  readonly iconClassName?: string;
}

const CHEVRON_PATHS = ["M15 19l-7-7 7-7", "M9 5l7 7-7 7"];

function DragHandle({ pulse, className, iconClassName }: DragHandleProps) {
  return (
    <motion.div
      animate={
        pulse
          ? {
              scale: [1, 1.15, 1],
              boxShadow: [
                "0px 0px 0px 0px rgba(128, 128, 128, 0)",
                "0px 0px 0px 12px rgba(128, 128, 128, 0.25)",
                "0px 0px 0px 0px rgba(128, 128, 128, 0)",
              ],
            }
          : {
              scale: 1,
              boxShadow: "0px 0px 0px 0px rgba(128, 128, 128, 0)",
            }
      }
      transition={
        pulse
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
      whileHover={{ scale: 1.25 }}
      className={cn(
        "border-border bg-background group-hover:border-primary/50 group-focus-visible/btn:ring-primary flex h-12 w-8 items-center justify-center gap-[1px] rounded-full border shadow-lg transition-colors group-focus-visible/btn:ring-2 group-focus-visible/btn:ring-offset-2",
        className,
      )}
    >
      {CHEVRON_PATHS.map((d) => (
        <svg
          key={d}
          className={cn(
            "text-muted-foreground group-hover:text-primary h-3 w-3 transition-colors dark:text-white",
            iconClassName,
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d={d}
          />
        </svg>
      ))}
    </motion.div>
  );
}

export default DragHandle;
