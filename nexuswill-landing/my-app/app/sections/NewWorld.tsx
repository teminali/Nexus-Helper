"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Sparkles, 
  Zap,
  TrendingUp,
  Shield,
  Rocket,
  ArrowRight,
  Star
} from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

// Deterministic pseudo-random function for SSR consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

const features = [
  {
    icon: Sparkles,
    title: "AI-Native Architecture",
    description: "Built from the ground up for the AI era. Not bolted on, but woven in.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "10x faster development cycles. Ship in hours what used to take weeks.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Battle Tested",
    description: "Enterprise-grade security and reliability. The New World demands strength.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: TrendingUp,
    title: "Exponential Growth",
    description: "Compound your capabilities. Each day you become more powerful than the last.",
    color: "from-amber-500 to-orange-500",
  },
];

export default function NewWorld() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();

  // Generate deterministic particle data
  const particles = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      left: seededRandom(i * 1.5) * 100,
      top: seededRandom(i * 2.5) * 100,
      duration: 3 + seededRandom(i * 3.5) * 2,
      delay: seededRandom(i * 4.5) * 3,
    }));
  }, []);

  return (
    <section id="new-world" className="relative min-h-screen py-24 overflow-hidden">
      {/* Darker, more intense background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Animated waves */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[300%] h-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, ${0.02 + i * 0.01}) 50%, transparent 100%)`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: ["-66%", "0%"],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Epic lightning */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`lightning-${i}`}
            className="absolute w-px bg-gradient-to-b from-purple-400 via-cyan-400 to-transparent"
            style={{
              left: `${10 + i * 20}%`,
              top: 0,
              height: "50%",
              filter: "blur(2px)",
            }}
            animate={{
              opacity: [0, 0.8, 0, 0.4, 0],
              scaleY: [0, 1, 0.5, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              times: [0, 0.1, 0.3, 0.5, 1],
            }}
          />
        ))}

        {/* Energy particles */}
        {particles.map((particle, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-purple-400"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}

        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            style={{
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17) % 100}%`,
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
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Badge variant="outline" className="mb-4 border-purple-500/50 text-purple-400">
              <Crown className="w-3 h-3 mr-1" />
              The New World
            </Badge>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <motion.span 
              className="text-white"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Where{" "}
            </motion.span>
            <motion.span 
              className="gradient-text inline-block"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
            >
              kings
            </motion.span>
            <motion.span 
              className="text-white"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {" "}emerge
            </motion.span>
          </h2>
          
          <motion.p 
            className="text-xl text-slate-400 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Post-timeskip. Everything is stronger. The real legends are made here.
            In the New World, AI doesn&apos;t help you code. It <span className="text-purple-400 font-semibold">becomes</span> the code.
          </motion.p>
        </motion.div>

        {/* Main Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, rotateX: -15 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="group h-full bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden card-shine magical-glow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <motion.div 
                        className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-purple-500/30 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <motion.h3 
                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.8 }}
                  >
                    We are the first ship that made it across.
                  </motion.h3>
                  <motion.p 
                    className="text-slate-400 max-w-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.9 }}
                  >
                    Join the crew that&apos;s writing the new rules. The old frameworks, 
                    old agile, old everything dies here. New standards are set by you.
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="group shrink-0 px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/25 animate-glow"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Enter the New World
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </CardContent>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
          </Card>
        </motion.div>

        {/* Silhouettes becoming legends */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20"
        >
          <div className="flex justify-center items-end gap-4 md:gap-8">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1 + i * 0.15 }}
              >
                <motion.div 
                  className="w-16 md:w-24 h-32 md:h-48 rounded-t-full"
                  style={{
                    background: `linear-gradient(to top, rgba(139, 92, 246, ${0.1 + i * 0.05}) 0%, transparent 100%)`,
                  }}
                  animate={{ 
                    scaleY: [1, 1.05, 1],
                    opacity: [0.4, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
                {/* Glow effect */}
                <motion.div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1 bg-purple-400 rounded-full blur-sm"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scaleX: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
                
                {/* Star above silhouette */}
                <motion.div
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                >
                  <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.p 
            className="text-center text-sm text-slate-500 mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Legends in the making
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
