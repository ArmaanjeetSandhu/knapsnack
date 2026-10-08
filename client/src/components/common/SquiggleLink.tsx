import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const BASELINE = 9;
const MAX_BEND = 6;
const FULL_BEND_WIDTH = 120;

const squigglePath = (width: number | null) => {
  const bend =
    width === null ? MAX_BEND : MAX_BEND * Math.min(1, width / FULL_BEND_WIDTH);
  const crest = +(BASELINE - bend).toFixed(2);
  const trough = +(BASELINE + bend).toFixed(2);

  return `M0,${BASELINE} Q25,${crest} 50,${BASELINE} Q75,${trough} 100,${BASELINE}`;
};

export const SquiggleLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const link = linkRef.current;
    if (!link || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    resizeObserver.observe(link);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <a
      ref={linkRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-block transition-opacity hover:opacity-80"
    >
      <span className="relative z-10">{children}</span>
      <svg
        className="absolute -bottom-2 left-0 w-full"
        height="14"
        viewBox="0 0 100 14"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d={squigglePath(width)}
          fill="none"
          stroke="var(--accent-highlight)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeInOut" }}
        />
      </svg>
    </a>
  );
};
