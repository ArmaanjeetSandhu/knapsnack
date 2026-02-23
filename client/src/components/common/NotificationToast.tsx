import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface NotificationToastProps {
  message: string;
  onDismiss: () => void;
  type?: "info" | "error";
}

const DURATION = 10;
const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const NotificationToast = ({
  message,
  onDismiss,
  type = "info",
}: NotificationToastProps) => {
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [shouldFlash, setShouldFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isError = type === "error";

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const flashTimer = setTimeout(() => setShouldFlash(true), 600);
      return () => clearTimeout(flashTimer);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) onDismiss();
  }, [timeLeft, onDismiss]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      className="group relative mb-6"
    >
      <motion.div
        animate={shouldFlash ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`absolute inset-0 -z-10 rounded-lg blur-md ${
          isError ? "bg-red-500/30" : "bg-primary/30"
        }`}
      />

      <div
        className={`flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3 text-black shadow-lg dark:bg-zinc-900 dark:text-white ${
          isError
            ? "border-red-200 dark:border-red-900"
            : "border-gray-200 dark:border-zinc-800"
        }`}
      >
        <div className="flex-1 text-sm font-medium">{message}</div>

        <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="20"
              cy="20"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="3"
              className={isError ? "text-red-500" : "text-current"}
            />
            <motion.circle
              cx="20"
              cy="20"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: CIRCUMFERENCE }}
              transition={{ duration: DURATION, ease: "linear" }}
              className={isError ? "text-red-500" : "text-current"}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
            {timeLeft}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationToast;
