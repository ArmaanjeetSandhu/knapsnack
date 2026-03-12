import { motion } from "framer-motion";
import React from "react";

export const SquiggleLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative inline-block transition-opacity hover:opacity-80"
  >
    <span className="relative z-10">{children}</span>
    <svg
      className="absolute -bottom-1 left-0 w-full sm:-bottom-2"
      height="14"
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d="M0,9 Q25,3 50,9 Q75,15 100,9"
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
