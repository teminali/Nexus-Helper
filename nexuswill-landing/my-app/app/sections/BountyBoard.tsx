"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Coins, Crosshair, Megaphone, Code, ArrowRight } from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

const bounties = [
  {
    id: "contributor",
    title: "Open Source Contributor",
    reward: "500M",
    description: "Submit PRs to our repos",
    icon: Code,
    difficulty: "Medium",
    color: "from-amber-500 to-orange-500",
    tasks: ["Fix bugs", "Add features", "Improve docs"],
  },
  {
    id: "hunter",
    title: "Bug Hunter",
    reward: "300M",
    description: "Find and report critical bugs",
    icon: Crosshair,
    difficulty: "Hard",
    color: "from-red-500 to-pink-500",
    tasks: ["Security issues", "Performance bugs", "Edge cases"],
  },
  {
    id: "evangelist",
    title: "Community Evangelist",
    reward: "200M",
    description: "Spread the word about Nexus Will",
    icon: Megaphone,
    difficulty: "Easy",
    color: "from-cyan-500 to-blue-500",
    tasks: ["Write tutorials", "Give talks", "Share on social"],
  },
];

export default function BountyBoard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();

  return (
    <section id="bounty-board" className="relative py-24 overflow-hidden">
      {/* Background - wanted poster style */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950">
        {/* Old paper texture effect */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-400">
            <Target className="w-3 h-3 mr-1" />
            {t("bountyBoard.badge")}
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">{t("bountyBoard.headline")}</span>{" "}
            <span className="gradient-text-gold">{t("bountyBoard.headlineHighlight")}</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            {t("bountyBoard.description")}
          </p>
        </motion.div>

        {/* Bounty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {bounties.map((bounty, index) => {
            const Icon = bounty.icon;
            return (
              <motion.div
                key={bounty.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              >
                <Card className="group h-full bg-slate-900/80 border-amber-900/30 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden">
                  {/* Wanted poster styling */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bounty.color} flex items-center justify-center`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-bold text-lg">{bounty.reward}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            bounty.difficulty === "Easy" 
                              ? "border-emerald-500/50 text-emerald-400"
                              : bounty.difficulty === "Medium"
                              ? "border-amber-500/50 text-amber-400"
                              : "border-red-500/50 text-red-400"
                          }`}
                        >
                          {bounty.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {bounty.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      {bounty.description}
                    </p>

                    {/* Tasks */}
                    <div className="space-y-2 mb-6">
                      {bounty.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                          {task}
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                    >
                      Claim Bounty
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>

                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-amber-500/30" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-amber-500/30" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-amber-500/30" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-amber-500/30" />
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 mb-4">
            All bounties paid in reputation points and exclusive crew benefits.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
          >
            <Target className="w-5 h-5 mr-2" />
            View All Bounties
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
