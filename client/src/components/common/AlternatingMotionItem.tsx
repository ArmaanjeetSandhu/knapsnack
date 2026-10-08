import { motion } from "framer-motion";
import React from "react";

interface AlternatingMotionItemProps {
  index: number;
  children: React.ReactNode;
  align?: "alternate" | "start";
}

export const AlternatingMotionItem = ({
  index,
  children,
  align = "alternate",
}: AlternatingMotionItemProps) => {
  const isEven = index % 2 === 0;
  const alternating = isEven ? "self-start text-left" : "self-end text-right";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex w-full flex-col ${
        align === "start" ? "text-left" : `max-w-4xl ${alternating}`
      }`}
    >
      {children}
    </motion.div>
  );
};
