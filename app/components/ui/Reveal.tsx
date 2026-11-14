import { motion, type HTMLMotionProps } from "motion/react";
import { useMountedAfterHydration } from "~/lib/hydration";

/**
 * Fades and lifts its content in when it scrolls into view. Content rendered by the server stays visible
 * (no animation), so nothing is hidden before JavaScript loads.
 */
export function Reveal({ delay = 0, y = 18, children, ...rest }: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  const animate = useMountedAfterHydration();
  return (
    <motion.div
      initial={animate ? { opacity: 0, y } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
