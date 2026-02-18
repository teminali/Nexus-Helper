"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Users, Sparkles } from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior Fullstack Engineer",
    company: "Formerly @ Google",
    content: "Joining Nexus Will was like finding the Log Pose I didn't know I needed. The AI integration isn't just a tool—it's become my first mate in every project.",
    rating: 5,
    avatar: "SC",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    role: "Tech Lead",
    company: "Startup Founder",
    content: "We crossed from the East Blue to the New World in months, not years. Our team's velocity increased 10x. This is how software should be built.",
    rating: 5,
    avatar: "MJ",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    name: "Yuki Tanaka",
    role: "AI Research Engineer",
    company: "Ex-OpenAI",
    content: "The contextual awareness is unlike anything I've seen. It's not just code completion—it's true pair programming with an AI that understands your entire codebase.",
    rating: 5,
    avatar: "YT",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    id: 4,
    name: "Zanele Mthembu",
    role: "DevOps Architect",
    company: "Enterprise Solutions",
    content: "Finally, a tool that understands the full stack. From infrastructure to frontend, Nexus Will has transformed how our entire organization builds software.",
    rating: 5,
    avatar: "ZM",
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function CrewStories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useTranslation();

  return (
    <section id="crew-stories" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Animated stars */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`shooting-${i}`}
            className="absolute w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 20}%`,
            }}
            animate={{
              x: ["-100%", "200%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 3,
              repeatDelay: 4,
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
            initial={{ scale: 0, rotate: 180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Badge variant="outline" className="mb-4 border-purple-500/50 text-purple-400">
              <Users className="w-3 h-3 mr-1" />
              Crew Stories
            </Badge>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <motion.span 
              className="text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Voices from the{" "}
            </motion.span>
            <motion.span 
              className="gradient-text inline-block"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            >
              Crew
            </motion.span>
          </h2>
          
          <motion.p 
            className="text-xl text-slate-400 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Hear from developers who have joined our voyage and transformed their journey across the AI seas.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30, x: index % 2 === 0 ? -20 : 20 }}
              animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <Card className="group h-full bg-slate-900/50 border-slate-800 hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden card-shine magical-glow">
                <CardContent className="p-8">
                  {/* Quote icon */}
                  <motion.div 
                    className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Quote className="w-16 h-16 text-cyan-400" />
                  </motion.div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <motion.p 
                    className="text-slate-300 text-lg leading-relaxed mb-6 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    &ldquo;{testimonial.content}&rdquo;
                  </motion.p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {testimonial.avatar}
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-slate-400">{testimonial.role}</p>
                      <p className="text-xs text-slate-500">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: "10,000+", label: "Crew Members", icon: Users },
            { value: "50M+", label: "Lines Generated", icon: Sparkles },
            { value: "99.9%", label: "Uptime", icon: Star },
            { value: "4.9/5", label: "Rating", icon: Star },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
              >
                <motion.div 
                  className="text-3xl md:text-4xl font-bold gradient-text mb-1"
                  whileHover={{ scale: 1.1 }}
                >
                  {stat.value}
                </motion.div>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Icon className="w-3 h-3" />
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
