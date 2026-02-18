"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowRight, Feather, Scroll, Compass } from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

const blogPosts = [
  {
    id: 1,
    title: "Why I Left the East Blue",
    excerpt: "The comfortable waters of traditional development were no longer enough. Here's why I set sail for the Grand Line.",
    date: "2024-02-10",
    readTime: "8 min read",
    category: "Manifesto",
    gradient: "from-cyan-500 to-blue-500",
    icon: Compass,
  },
  {
    id: 2,
    title: "Surviving Bug Hell: A Captain's Guide",
    excerpt: "How AI-powered debugging changed everything. From endless nights to swift resolutions.",
    date: "2024-02-08",
    readTime: "6 min read",
    category: "Guide",
    gradient: "from-purple-500 to-pink-500",
    icon: Scroll,
  },
  {
    id: 3,
    title: "The Crew You Need in the New World",
    excerpt: "Building a team ready for AI-native development. Skills that matter, roles that transform.",
    date: "2024-02-05",
    readTime: "10 min read",
    category: "Team",
    gradient: "from-amber-500 to-orange-500",
    icon: Feather,
  },
];

export default function CaptainsLog() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();

  return (
    <section id="captains-log" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 ocean-bg">
        {/* Animated paper texture */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, rgba(56, 189, 248, 0.1) 0px, transparent 1px, transparent 11px, rgba(56, 189, 248, 0.1) 12px)`,
          }}
        />
        
        {/* Floating ink particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-600/30"
            style={{
              left: `${(i * 11) % 100}%`,
              top: `${(i * 17) % 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 5 + (i % 3),
              repeat: Infinity,
              delay: i * 0.5,
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
            initial={{ rotate: -10, scale: 0 }}
            animate={isInView ? { rotate: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Badge variant="outline" className="mb-4 border-amber-500/50 text-amber-400">
              <BookOpen className="w-3 h-3 mr-1" />
              Captain&apos;s Log
            </Badge>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <motion.span 
              className="text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Tales from the{" "}
            </motion.span>
            <motion.span 
              className="gradient-text-gold inline-block"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            >
              Grand Line
            </motion.span>
          </h2>
          
          <motion.p 
            className="text-xl text-slate-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Chronicles of those who dared to sail these waters. Stories of triumph, lessons learned, and the Will that drives us forward.
          </motion.p>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => {
            const Icon = post.icon;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30, rotateY: -15 }}
                animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
                whileHover={{ y: -10 }}
              >
                <Card className="group h-full bg-slate-900/50 border-slate-800 hover:border-amber-500/30 transition-all duration-300 overflow-hidden cursor-pointer card-shine">
                  <CardContent className="p-0">
                    {/* Image placeholder with gradient */}
                    <div className={`h-48 bg-gradient-to-br ${post.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ x: "-100%", opacity: 0 }}
                        whileHover={{ x: "100%", opacity: 0.3 }}
                        transition={{ duration: 0.6 }}
                      />
                      
                      {/* Animated background pattern */}
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                          backgroundSize: "20px 20px",
                        }}
                        animate={{ backgroundPosition: ["0 0", "20px 20px"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      
                      <motion.div 
                        className="absolute top-4 left-4"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      >
                        <Badge className="bg-black/30 text-white border-0 backdrop-blur-sm">
                          {post.category}
                        </Badge>
                      </motion.div>
                      
                      <motion.div 
                        className="absolute bottom-4 right-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Icon className="w-8 h-8 text-white/50" />
                      </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : {}}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          {post.date}
                        </motion.span>
                        <motion.span 
                          className="flex items-center gap-1"
                          initial={{ opacity: 0 }}
                          animate={isInView ? { opacity: 1 } : {}}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </motion.span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>

                      <motion.div 
                        className="flex items-center text-amber-400 text-sm font-medium"
                        whileHover={{ x: 5 }}
                      >
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-amber-500/50"
            >
              View All Logs
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
