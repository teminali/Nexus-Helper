"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Cloud, 
  Star,
  Zap,
  Code2,
  Layers,
  Sparkles,
  ArrowUpRight,
  Check
} from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";
import { useTheme } from "@/app/contexts/ThemeContext";

// Deterministic pseudo-random function for SSR consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const roadmapItems = [
  { phase: "Phase 1", title: "Nexus Helper", status: "complete", description: "Your first weapon. Chrome extension for AI-powered coding." },
  { phase: "Phase 2", title: "The Ship", status: "in-progress", description: "The full platform. App.nexuswill.com comes online." },
  { phase: "Phase 3", title: "The Crew", status: "upcoming", description: "Community tools, bounties, the tavern opens." },
  { phase: "Phase 4", title: "Devil Fruits", status: "upcoming", description: "Specialized AI agents for every domain." },
];

const powers = [
  {
    icon: Code2,
    title: "Fullstack Mastery",
    description: "Frontend, backend, infrastructure—all unified under your Will",
  },
  {
    icon: Layers,
    title: "Dimensional Thinking",
    description: "See across abstractions. Understand systems within systems",
  },
  {
    icon: Sparkles,
    title: "Creative Flow",
    description: "Ideas manifest as working code. The barrier dissolves",
  },
  {
    icon: Zap,
    title: "Lightning Reflexes",
    description: "React to changes instantly. Adapt before others perceive",
  },
];

export default function SkyIslands() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Generate deterministic particle data
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      left: seededRandom(i * 1.7) * 100,
      top: seededRandom(i * 2.7) * 100,
      delay: seededRandom(i * 3.7) * 4,
    }));
  }, []);

  return (
    <section id="sky-islands" className="relative min-h-screen py-24 overflow-hidden">
      {/* Adaptive background */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        isDark 
          ? "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" 
          : "bg-gradient-to-b from-amber-50 via-white to-slate-50"
      }`}>
        {/* Floating clouds */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 15}%`,
              top: `${10 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Cloud 
              className={`w-24 h-24 md:w-32 md:h-32 transition-colors duration-500 ${
                isDark ? "text-slate-700/30" : "text-slate-200/50"
              }`}
              strokeWidth={1}
            />
          </motion.div>
        ))}

        {/* Golden/Dark light rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className={`absolute top-0 w-px h-[50%] bg-gradient-to-b ${
              isDark 
                ? "from-purple-500/20 to-transparent" 
                : "from-amber-300/30 to-transparent"
            }`}
            style={{
              left: `${10 + i * 12}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        {/* Floating particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className={`absolute w-1 h-1 rounded-full transition-colors duration-500 ${
              isDark ? "bg-purple-400" : "bg-amber-400"
            }`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Animated stars for dark mode */}
        {isDark && [...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className={`mb-4 transition-colors duration-500 ${
            isDark 
              ? "border-purple-500/50 text-purple-400" 
              : "border-amber-500/50 text-amber-600 bg-white/50"
          }`}>
            <Cloud className="w-3 h-3 mr-1" />
            {t("skyIslands.badge")}
          </Badge>
          <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 transition-colors duration-500 ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            {t("skyIslands.headline")} <span className="gradient-text-gold">{t("skyIslands.headlineHighlight")}</span>
          </h2>
          <p className={`text-xl max-w-3xl mx-auto transition-colors duration-500 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            {t("skyIslands.description")}
          </p>
        </motion.div>

        {/* Powers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {powers.map((power, index) => {
            const Icon = power.icon;
            return (
              <motion.div
                key={power.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="group"
              >
                <Card className={`h-full transition-all duration-500 card-shine ${
                  isDark 
                    ? "bg-slate-900/50 border-slate-800 hover:border-amber-500/30" 
                    : "bg-white/80 border-slate-200 hover:border-amber-300"
                } hover:shadow-xl hover:-translate-y-1`}>
                  <CardContent className="p-6 text-center">
                    <motion.div 
                      className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className={`text-lg font-bold mb-2 transition-colors duration-500 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {power.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-500 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      {power.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Poneglyph-style Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-10">
            <h3 className={`text-2xl font-bold mb-2 transition-colors duration-500 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>The Ancient Roadmap</h3>
            <p className={`transition-colors duration-500 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>Poneglyphs guide the way to the ultimate treasure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmapItems.map((item, index) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`h-full relative overflow-hidden transition-all duration-500 ${
                  item.status === "complete" 
                    ? isDark 
                      ? "bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-700/50" 
                      : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
                    : item.status === "in-progress"
                    ? isDark 
                      ? "bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-700/50" 
                      : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                    : isDark 
                      ? "bg-slate-900/50 border-slate-700" 
                      : "bg-slate-50 border-slate-200"
                }`}>
                  <CardContent className="p-6">
                    {/* Status indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-mono px-2 py-1 rounded transition-colors duration-500 ${
                        item.status === "complete" 
                          ? isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                          : item.status === "in-progress"
                          ? isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                          : isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-600"
                      }`}>
                        {item.phase}
                      </span>
                      {item.status === "complete" && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                      {item.status === "in-progress" && (
                        <motion.div
                          className="w-2 h-2 rounded-full bg-amber-500"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </div>
                    
                    <h4 className={`font-bold mb-2 transition-colors duration-500 ${
                      item.status === "upcoming" 
                        ? isDark ? "text-slate-400" : "text-slate-400"
                        : isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {item.title}
                    </h4>
                    <p className={`text-sm transition-colors duration-500 ${
                      item.status === "upcoming" 
                        ? isDark ? "text-slate-500" : "text-slate-400"
                        : isDark ? "text-slate-400" : "text-slate-600"
                    }`}>
                      {item.description}
                    </p>

                    {/* Decorative elements */}
                    <div className="absolute top-2 right-2 opacity-10">
                      <Star className={`w-8 h-8 transition-colors duration-500 ${
                        isDark ? "text-white" : "text-slate-900"
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
        >
          <Card className={`transition-colors duration-500 ${
            isDark 
              ? "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700" 
              : "bg-gradient-to-br from-white to-slate-50 border-slate-200"
          } overflow-hidden`}>
            <CardContent className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                <h3 className={`text-2xl md:text-3xl font-bold mb-4 transition-colors duration-500 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Fullstack engineers become gods
                </h3>
                <p className={`mb-8 transition-colors duration-500 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}>
                  This is the place where your skills transcend. Where you wield 
                  AI not as a tool, but as an extension of your Will.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="group px-8 py-6 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl shadow-lg shadow-amber-500/25 animate-glow-gold"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Ascend to Sky Islands
                      <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </motion.div>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`px-8 py-6 text-lg font-medium rounded-xl transition-colors duration-500 ${
                      isDark 
                        ? "border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white" 
                        : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Read the Manifesto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
