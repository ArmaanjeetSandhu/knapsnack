import { motion } from "framer-motion";
import React from "react";

interface AlternatingMotionItemProps {
  index: number;
  children: React.ReactNode;
}

export const AlternatingMotionItem = ({
  index,
  children,
}: AlternatingMotionItemProps) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex w-full max-w-4xl flex-col ${
        isEven ? "self-start text-left" : "self-end text-right"
      }`}
    >
      {children}
    </motion.div>
  );
};
