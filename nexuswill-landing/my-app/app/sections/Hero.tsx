"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Zap, Waves, Anchor } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "@/app/contexts/LanguageContext";
import { Ocean3D } from "@/app/components/3d/Ocean3D";

// Deterministic pseudo-random function for SSR consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

export default function Hero() {
  const { t } = useTranslation();
  
  const scrollToGrandLine = () => {
    const element = document.getElementById("grand-line");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generate deterministic particle data
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      left: seededRandom(i * 1.1) * 100,
      top: seededRandom(i * 2.2) * 100,
      duration: 4 + seededRandom(i * 3.3) * 4,
      delay: seededRandom(i * 4.4) * 2,
      content: ["{ }", "</>", "AI", "0101", "λ", "Σ", "∞"][i % 7],
    }));
  }, []);

  return (
    <section id="reverse-mountain" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Ocean Background */}
      <Ocean3D />
      
      {/* Animated Ocean Background Overlay */}
      <div className="absolute inset-0 ocean-bg opacity-80">
        {/* Animated waves */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Wave layers */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[200%] h-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, ${0.03 + i * 0.01}) 50%, transparent 100%)`,
                top: `${20 + i * 15}%`,
              }}
              animate={{
                x: ["-50%", "0%"],
              }}
              transition={{
                duration: 15 + i * 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
          
          {/* Floating code particles */}
          {particles.map((particle, i) => (
            <motion.div
              key={`code-${i}`}
              className="absolute text-cyan-500/20 font-mono text-xs"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            >
              {particle.content}
            </motion.div>
          ))}
        </div>

        {/* Lightning effects */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`lightning-${i}`}
              className="absolute w-px bg-gradient-to-b from-cyan-400 via-purple-400 to-transparent"
              style={{
                left: `${20 + i * 30}%`,
                top: 0,
                height: "40%",
                filter: "blur(1px)",
              }}
              animate={{
                opacity: [0, 0.6, 0, 0.3, 0],
                scaleY: [0, 1, 0.5, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1.5,
                times: [0, 0.1, 0.3, 0.5, 1],
              }}
            />
          ))}
        </div>

        {/* Thunder flash overlay */}
        <motion.div
          className="absolute inset-0 bg-cyan-400/5 pointer-events-none"
          animate={{
            opacity: [0, 0, 0.1, 0, 0, 0.05, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            times: [0, 0.88, 0.9, 0.92, 0.96, 0.98, 1],
          }}
        />
      </div>

      {/* Ship Silhouette */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-30"
        animate={{
          y: [0, -15, 0],
          rotate: [-1, 1, -1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <svg
          viewBox="0 0 400 200"
          className="w-[600px] h-[300px] md:w-[800px] md:h-[400px]"
          fill="currentColor"
        >
          <path
            d="M200 180 Q 100 180 50 150 L 30 130 Q 100 140 200 140 Q 300 140 370 130 L 350 150 Q 300 180 200 180 Z"
            className="text-slate-700"
          />
          <rect x="190" y="40" width="20" height="100" className="text-slate-600" />
          <path
            d="M210 50 L 280 90 L 210 90 Z"
            className="text-slate-600"
          />
          <path
            d="M190 60 L 120 100 L 190 100 Z"
            className="text-slate-600"
          />
        </svg>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Pre-title badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-slate-300 font-mono">{t("hero.badge")}</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
        >
          <span className="block text-white mb-2">{t("hero.headline1")}</span>
          <span className="gradient-text">{t("hero.headline2")}</span>
        </motion.h1>

        {/* Subheadlines */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-3 mb-10"
        >
          <p className="text-xl sm:text-2xl text-slate-300">
            {t("hero.subline1")}
          </p>
          <p className="text-xl sm:text-2xl text-slate-300">
            {t("hero.subline2")} <span className="text-cyan-400 font-semibold">{t("hero.subline2Highlight")}</span>.
          </p>
          <p className="text-lg sm:text-xl text-slate-400">
            {t("hero.subline3")}
          </p>
          <p className="text-lg sm:text-xl">
            <span className="text-amber-400 font-semibold">{t("hero.subline4")}</span>
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={scrollToGrandLine}
            className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl overflow-hidden transition-all duration-300 shadow-lg shadow-cyan-500/25"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Anchor className="w-5 h-5" />
              {t("hero.ctaPrimary")}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-6 text-lg font-medium border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-xl transition-all"
          >
            <Waves className="w-5 h-5 mr-2" />
            {t("hero.ctaSecondary")}
          </Button>
        </motion.div>

        {/* Stats / Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 pt-8 border-t border-slate-800/50"
        >
          <p className="text-sm text-slate-500 mb-4">{t("hero.footer")}</p>
          <div className="flex items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{t("hero.tag1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>{t("hero.tag2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{t("hero.tag3")}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-slate-500"
        >
          <span className="text-xs uppercase tracking-widest">{t("hero.scrollIndicator")}</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
