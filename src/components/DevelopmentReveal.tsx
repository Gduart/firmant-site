"use client";
import { motion, useInView } from "framer-motion";
import { type ReactNode, useRef } from "react";
export function DevelopmentReveal({ children }: { children: ReactNode }) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: "-60px" });
  return <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: .7, ease: [.16, 1, .3, 1] }}>{children}</motion.div>;
}
