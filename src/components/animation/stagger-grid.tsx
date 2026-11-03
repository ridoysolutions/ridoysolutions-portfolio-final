"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function StaggerGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div className={className} initial="hidden" animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduceMotion ? 0 : 0.065 } } }}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={{ hidden: { opacity: 0, y: reduceMotion ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" } } }}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>{children}</motion.div>}
    </motion.div>
  );
}
