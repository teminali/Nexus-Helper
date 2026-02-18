"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import { useTranslation } from "@/app/contexts/LanguageContext";

interface LogPoseProps {
  sections: { id: string; label: string }[];
}

export default function LogPose({ sections }: LogPoseProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      for (let i = 0; i < sections.length; i++) {
        const element = document.getElementById(sections[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            if (activeSection !== i) {
              setActiveSection(i);
              // Calculate rotation based on section index
              const targetRotation = i * (360 / sections.length);
              setRotation(targetRotation);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, activeSection]);

  const scrollToSection = (index: number) => {
    const element = document.getElementById(sections[index].id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Log Pose - Fixed to top right */}
      <motion.div
        className="fixed top-20 right-6 z-50 hidden md:block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          
          {/* Compass Container */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-16 h-16 rounded-full glass flex items-center justify-center cursor-pointer group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Outer ring */}
            <div className="absolute inset-1 rounded-full border-2 border-cyan-500/30" />
            
            {/* Compass needle */}
            <motion.div
              className="relative"
              animate={{ rotate: rotation }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <Compass className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </motion.div>
            
            {/* Center dot */}
            <div className="absolute w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
            
            {/* Direction indicators */}
            <div className="absolute -top-1 text-[8px] font-bold text-cyan-400">N</div>
            <div className="absolute -bottom-1 text-[8px] font-bold text-cyan-400">S</div>
            <div className="absolute -left-1 text-[8px] font-bold text-cyan-400">W</div>
            <div className="absolute -right-1 text-[8px] font-bold text-cyan-400">E</div>
          </motion.button>
          
          {/* Dropdown menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="absolute top-full right-0 mt-4 w-48 glass rounded-xl overflow-hidden"
              >
                <div className="p-2">
                  <div className="text-xs text-cyan-400 font-mono mb-2 px-2 uppercase tracking-wider">
                    {t("logPose.title")}
                  </div>
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      onClick={() => scrollToSection(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === index
                          ? "bg-cyan-500/20 text-cyan-300"
                          : "text-slate-300 hover:bg-slate-800/50"
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          activeSection === index ? "bg-amber-400" : "bg-slate-600"
                        }`} />
                        {section.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Mobile Floating Orb */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 md:hidden"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(56, 189, 248, 0.3)",
              "0 0 40px rgba(56, 189, 248, 0.5)",
              "0 0 20px rgba(56, 189, 248, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Compass className="w-6 h-6 text-white" />
          </motion.div>
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-4 w-56 glass rounded-xl overflow-hidden"
            >
              <div className="p-3">
                <div className="text-xs text-cyan-400 font-mono mb-2 px-2 uppercase tracking-wider">
                  {t("logPose.title")}
                </div>
                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    onClick={() => scrollToSection(index)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                      activeSection === index
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800/50"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activeSection === index ? "bg-amber-400" : "bg-slate-600"
                      }`} />
                      {section.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
