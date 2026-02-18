"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Anchor, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/app/contexts/LanguageContext";

const navItems = [
  { id: "reverse-mountain", label: "Home" },
  { id: "grand-line", label: "Challenges" },
  { id: "new-world", label: "Future" },
  { id: "sky-islands", label: "Power" },
  { id: "captains-log", label: "Blog" },
  { id: "crew-stories", label: "Stories" },
  { id: "bounty-board", label: "Bounties" },
];

export function Header() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.9)"]
  );
  
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(148, 163, 184, 0)", "rgba(148, 163, 184, 0.1)"]
  );

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.header
        style={{
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
        }}
        className="fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.button
              onClick={() => scrollToSection("reverse-mountain")}
              className="flex items-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-shadow">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg hidden sm:block">
                Nexus Will
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className="text-slate-400 hover:text-white hover:bg-white/5 text-xs"
                >
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle />
              
              <Button
                size="sm"
                className="hidden sm:flex ml-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                onClick={() => scrollToSection("subdomains")}
              >
                Our Products
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-300" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-300" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
        }}
        className="fixed inset-x-0 top-16 z-30 lg:hidden"
      >
        <div className="mx-4 mt-2 p-4 rounded-xl glass border border-slate-700/50">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => scrollToSection(item.id)}
                className="justify-start text-slate-300 hover:text-white hover:bg-white/5"
              >
                {item.label}
              </Button>
            ))}
            <div className="border-t border-slate-700/50 my-2" />
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
              onClick={() => scrollToSection("subdomains")}
            >
              View Products
            </Button>
          </nav>
        </div>
      </motion.div>
    </>
  );
}
