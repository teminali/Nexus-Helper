"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  LayoutGrid, 
  Puzzle,
  BookOpen,
  Users,
  Sparkles,
  ExternalLink,
  Anchor,
  ArrowRight,
  Zap,
  Shield,
  Rocket,
  Code2,
  Terminal,
  MessageCircle,
  Cpu
} from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

const products = [
  {
    subdomain: "nexuswill.com",
    name: "The Grand Line",
    tagline: "Your Portal to the AI Era",
    description: "Main storytelling hub, blog, manifesto, and crew recruitment. This is where your journey begins.",
    features: ["Interactive Story", "Captain's Log", "Community Hub"],
    icon: Globe,
    color: "from-cyan-500 to-blue-600",
    glowColor: "cyan",
    status: "live",
    cta: "Explore",
    href: "https://nexuswill.com",
    highlight: true,
  },
  {
    subdomain: "app.nexuswill.com",
    name: "The Thousand Sunny",
    tagline: "Your Ship, Your Command",
    description: "The actual platform — core product where you build, ship, and scale with AI.",
    features: ["AI-Native IDE", "Team Collaboration", "Auto-Deploy"],
    icon: LayoutGrid,
    color: "from-purple-500 to-pink-600",
    glowColor: "purple",
    status: "coming-soon",
    cta: "Coming Soon",
  },
  {
    subdomain: "helper.nexuswill.com",
    name: "Nexus Helper",
    tagline: "Your First Weapon",
    description: "Chrome extension for AI-powered coding. Write code 10x faster, everywhere.",
    features: ["Any Editor", "Context Aware", "One-Click Install"],
    icon: Puzzle,
    color: "from-amber-500 to-orange-600",
    glowColor: "amber",
    status: "live",
    cta: "Install Now",
    href: "https://helper.nexuswill.com",
    popular: true,
  },
  {
    subdomain: "docer.nexuswill.com",
    name: "Nexus Docer",
    tagline: "The Ancient Knowledge",
    description: "Publish, manage, and share your API documentation. Import from Postman and access from anywhere.",
    features: ["API Docs", "Postman Import", "Share & Collaborate"],
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    glowColor: "emerald",
    status: "live",
    cta: "Open Docer",
    href: "https://docer.nexuswill.com",
  },
  {
    subdomain: "crew.nexuswill.com",
    name: "The Tavern",
    tagline: "Where Legends Gather",
    description: "Community, forums, bounties, crew recruitment. Join the conversation.",
    features: ["Forums", "Bounties", "Events"],
    icon: Users,
    color: "from-rose-500 to-red-600",
    glowColor: "rose",
    status: "coming-soon",
    cta: "Coming Soon",
  },
  {
    subdomain: "ai.nexuswill.com",
    name: "Devil Fruits",
    tagline: "Superhuman Powers",
    description: "Future AI tools — specialized agents for every domain. Unlock your potential.",
    features: ["Specialized Agents", "Custom Models", "API Access"],
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    glowColor: "violet",
    status: "coming-soon",
    cta: "Coming Soon",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function Subdomains() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <section id="subdomains" className="relative min-h-screen py-32 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        
        {/* Animated grid */}
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
          animate={{ backgroundPosition: ["0 0", "60px 60px"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${(i * 5) % 100}%`,
              top: `${(i * 7) % 100}%`,
              backgroundColor: i % 2 === 0 ? "rgba(56, 189, 248, 0.5)" : "rgba(139, 92, 246, 0.5)",
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Label */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
              <Badge 
                variant="outline" 
                className="relative px-4 py-2 text-base border-cyan-400/50 text-cyan-300 bg-cyan-950/30 backdrop-blur-sm"
              >
                <Anchor className="w-4 h-4 mr-2" />
                Our Fleet — Choose Your Path
              </Badge>
            </div>
          </motion.div>
          
          {/* Main Title */}
          <motion.h2 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-white">Chart Your </span>
            <span className="gradient-text">Course</span>
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p 
            className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Six powerful tools. One unified ecosystem. 
            <span className="text-cyan-400"> Everything you need</span> to navigate the AI revolution.
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product, index) => {
            const Icon = product.icon;
            const isHovered = hoveredProduct === product.subdomain;
            
            return (
              <motion.div
                key={product.subdomain}
                variants={itemVariants}
                onMouseEnter={() => setHoveredProduct(product.subdomain)}
                onMouseLeave={() => setHoveredProduct(null)}
                className={`relative group ${product.highlight ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Glow effect */}
                <motion.div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${product.color} rounded-2xl opacity-0 group-hover:opacity-70 blur transition-opacity duration-500`}
                  animate={isHovered ? { opacity: 0.7 } : { opacity: 0 }}
                />
                
                {/* Popular badge */}
                {product.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-3 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </motion.div>
                )}

                <Card className="relative h-full bg-slate-950/80 border-slate-800 hover:border-slate-700 transition-all duration-500 overflow-hidden group-hover:translate-y-[-4px]">
                  <CardContent className="p-0">
                    {/* Top gradient bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${product.color}`} />
                    
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <motion.div 
                          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-7 h-7 text-white" />
                        </motion.div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {/* Status */}
                          {product.status === "live" ? (
                            <motion.span 
                              className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium border border-emerald-500/30 flex items-center gap-1"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live
                            </motion.span>
                          ) : product.status === "beta" ? (
                            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">
                              Beta
                            </span>
                          ) : (
                            <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-400 font-medium border border-slate-600">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                          {product.name}
                        </h3>
                        <p className={`text-sm font-medium bg-gradient-to-r ${product.color} bg-clip-text text-transparent mb-2`}>
                          {product.tagline}
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        {product.features.map((feature, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Domain */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-4 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
                        <Terminal className="w-3 h-3" />
                        {product.subdomain}
                      </div>

                      {/* CTA Button */}
                      <motion.div
                        whileHover={{ scale: product.status === "coming-soon" ? 1 : 1.02 }}
                        whileTap={{ scale: product.status === "coming-soon" ? 1 : 0.98 }}
                      >
                        {product.status === "coming-soon" ? (
                          <Button
                            className="w-full bg-slate-800/60 text-slate-500 font-semibold cursor-default border border-slate-700/50 hover:bg-slate-800/60"
                            size="sm"
                            disabled
                            title="Coming Soon"
                          >
                            {product.cta}
                          </Button>
                        ) : (
                          <a href={(product as { href?: string }).href || `https://${product.subdomain}`} target="_blank" rel="noopener noreferrer">
                            <Button
                              className={`w-full bg-gradient-to-r ${product.color} hover:opacity-90 text-white font-semibold group/btn`}
                              size="sm"
                            >
                              {product.cta}
                              <ExternalLink className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>
                          </a>
                        )}
                      </motion.div>
                    </div>
                  </CardContent>

                  {/* Hover shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <Card className="inline-block bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-800 p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Not sure where to start?</h3>
                <p className="text-slate-400">Every journey begins with a single step. Try Nexus Helper — it&apos;s free.</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="https://helper.nexuswill.com" target="_blank" rel="noopener noreferrer">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-8"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Your Journey
                  </Button>
                </a>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-500"
        >
          {[
            { icon: Shield, text: "Enterprise Security" },
            { icon: Code2, text: "Open Source" },
            { icon: MessageCircle, text: "24/7 Support" },
            { icon: Cpu, text: "AI-Powered" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={i}
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.1 + i * 0.1 }}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.text}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
