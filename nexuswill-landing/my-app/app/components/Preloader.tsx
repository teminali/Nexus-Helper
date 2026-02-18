"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Anchor, Waves } from "lucide-react";

interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
        >
          {/* Animated background waves */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[200%] h-full opacity-10"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.3) 50%, transparent 100%)`,
                  top: `${30 + i * 20}%`,
                }}
                animate={{
                  x: ["-50%", "0%"],
                }}
                transition={{
                  duration: 8 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [-2, 2, -2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Anchor className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              {/* Orbiting elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Nexus Will
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 mb-8"
            >
              Preparing your ship...
            </motion.p>

            {/* Progress bar */}
            <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Progress percentage */}
            <motion.p
              className="mt-4 text-sm text-slate-500 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Math.min(Math.round(progress), 100)}%
            </motion.p>

            {/* Loading tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 flex items-center gap-2 text-xs text-slate-600"
            >
              <Waves className="w-3 h-3 animate-pulse" />
              <span>Calibrating Log Pose...</span>
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute bottom-8 left-8 text-xs text-slate-700 font-mono">
            <div>COORDINATES: UNKNOWN</div>
            <div>OCEAN: GRAND LINE</div>
          </div>

          <div className="absolute bottom-8 right-8 text-xs text-slate-700 font-mono text-right">
            <div>SHIP: THOUSAND SUNNY</div>
            <div>STATUS: BOARDING</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
