"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bug, 
  Brain, 
  Clock, 
  Users, 
  MapPin, 
  Target,
  Navigation,
  Anchor,
  Waves
} from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

const islands = [
  {
    id: "bug-hell",
    name: "Bug Hell",
    icon: Bug,
    description: "Endless debugging loops that drain your soul",
    solution: "AI-powered error detection & resolution",
    color: "from-red-500 to-orange-500",
    position: { x: 15, y: 20 },
  },
  {
    id: "context-loss",
    name: "Context Loss Cove",
    icon: Brain,
    description: "Forgetting why you wrote that code 3 days ago",
    solution: "Persistent AI memory across sessions",
    color: "from-purple-500 to-indigo-500",
    position: { x: 75, y: 15 },
  },
  {
    id: "slow-teams",
    name: "Slow Team Lagoon",
    icon: Clock,
    description: "Reviews take forever, releases crawl",
    solution: "Automated code review & deployment",
    color: "from-amber-500 to-yellow-500",
    position: { x: 80, y: 60 },
  },
  {
    id: "island-silos",
    name: "Silo Islands",
    icon: Users,
    description: "Knowledge trapped in individual minds",
    solution: "Shared AI context for your entire crew",
    color: "from-cyan-500 to-blue-500",
    position: { x: 25, y: 70 },
  },
  {
    id: "legacy-sea",
    name: "Legacy Code Sea",
    icon: Anchor,
    description: "Ancient codebase nobody understands",
    solution: "AI code archaeology & modernization",
    color: "from-slate-500 to-zinc-500",
    position: { x: 50, y: 45 },
  },
];

export default function GrandLine() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeIsland, setActiveIsland] = useState<string | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <section id="grand-line" className="relative min-h-screen py-24 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 ocean-bg">
        {/* Animated grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        
        {/* Animated fog */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[200%] h-32 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
            style={{ top: `${30 + i * 25}%` }}
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
          />
        ))}

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/50"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.3,
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
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <Badge variant="outline" className="mb-4 border-cyan-500/50 text-cyan-400">
              <Navigation className="w-3 h-3 mr-1" />
              The Grand Line
            </Badge>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <motion.span 
              className="text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              This is where{" "}
            </motion.span>
            <motion.span 
              className="text-red-400 inline-block"
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
            >
              99%
            </motion.span>
            <motion.span 
              className="text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {" "}of teams get lost
            </motion.span>
          </h2>
          
          <motion.p 
            className="text-xl text-slate-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            The chaotic, beautiful reality of building software today with AI. 
            Dangerous waters, unexpected challenges, legends being born.
          </motion.p>
        </motion.div>

        {/* Interactive Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Map Container */}
          <div className="relative aspect-[16/10] glass rounded-3xl overflow-hidden border border-slate-700/50">
            {/* Map Background - Ocean texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
              {/* Animated ocean waves pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                    <path d="M0 10 Q 25 0, 50 10 T 100 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#waves)" className="text-cyan-400"/>
              </svg>
              
              {/* Animated route lines connecting islands */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* Draw animated routes between islands */}
                <motion.path
                  d={`M ${islands[0].position.x}% ${islands[0].position.y}% 
                      Q 45% 30%, ${islands[4].position.x}% ${islands[4].position.y}%
                      Q 60% 50%, ${islands[2].position.x}% ${islands[2].position.y}%`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 2, delay: 0.5 }}
                />
                <motion.path
                  d={`M ${islands[1].position.x}% ${islands[1].position.y}% 
                      Q 65% 35%, ${islands[4].position.x}% ${islands[4].position.y}%`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.5, delay: 0.7 }}
                />
                <motion.path
                  d={`M ${islands[3].position.x}% ${islands[3].position.y}% 
                      Q 35% 55%, ${islands[4].position.x}% ${islands[4].position.y}%`}
                  fill="none"
                  stroke="url(#routeGradient)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.5, delay: 0.9 }}
                />
              </svg>
            </div>

            {/* Islands */}
            {islands.map((island, index) => {
              const Icon = island.icon;
              const isActive = activeIsland === island.id;
              const isHovered = hoveredIsland === island.id;
              
              return (
                <motion.button
                  key={island.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${island.position.x}%`,
                    top: `${island.position.y}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  onClick={() => setActiveIsland(isActive ? null : island.id)}
                  onMouseEnter={() => setHoveredIsland(island.id)}
                  onMouseLeave={() => setHoveredIsland(null)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Island glow */}
                  <motion.div 
                    className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 bg-gradient-to-r ${island.color}`}
                    animate={{
                      opacity: isActive || isHovered ? 0.8 : 0.3,
                      scale: isActive || isHovered ? 1.5 : 1,
                    }}
                  />
                  
                  {/* Island icon */}
                  <motion.div 
                    className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? "bg-slate-800 ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-400" 
                        : "bg-slate-800/80"
                    }`}
                    whileHover={{ rotate: 10 }}
                  >
                    <Icon className={`w-6 h-6 transition-colors ${
                      isActive || isHovered ? "text-white" : "text-slate-400"
                    }`} />
                  </motion.div>
                  
                  {/* Island label */}
                  <motion.div
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                    animate={{ 
                      opacity: isActive || isHovered ? 1 : 0.7,
                      y: isActive || isHovered ? 0 : 5,
                    }}
                  >
                    <span className="text-xs font-medium text-slate-300">{island.name}</span>
                  </motion.div>

                  {/* Active tooltip */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute top-full mt-8 left-1/2 -translate-x-1/2 w-64 z-20"
                    >
                      <Card className="bg-slate-900/95 border-slate-700 magical-glow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <motion.div 
                              className={`w-8 h-8 rounded-full bg-gradient-to-r ${island.color} flex items-center justify-center`}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </motion.div>
                            <h4 className="font-semibold text-white">{island.name}</h4>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">{island.description}</p>
                          <div className="flex items-start gap-2 text-sm">
                            <Target className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                            <span className="text-cyan-300">{island.solution}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}

            {/* Ship marker */}
            <motion.div
              className="absolute"
              style={{ left: "50%", top: "45%" }}
              animate={{
                x: [0, 15, 0, -15, 0],
                y: [0, -8, 0, -8, 0],
              }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 w-8 h-8 bg-cyan-400 rounded-full blur-lg"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Anchor className="w-4 h-4 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Map Legend */}
            <motion.div 
              className="absolute bottom-4 left-4 glass rounded-xl p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 1 }}
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <MapPin className="w-3 h-3" />
                <span>Click islands to explore</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-500/50 to-purple-500/50" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0, currentColor 4px, transparent 4px, transparent 8px)" }} />
                <span className="text-xs text-slate-500">Your route</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-lg text-slate-400 italic">
            &ldquo;We give you the <span className="text-amber-400 font-semibold">Log Pose</span>.&rdquo;
          </p>
          
          {/* Decorative waves */}
          <motion.div 
            className="flex justify-center gap-1 mt-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {[...Array(5)].map((_, i) => (
              <Waves key={i} className="w-6 h-6 text-cyan-500/30" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
