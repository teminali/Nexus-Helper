"use client";

import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Preloader } from "./components/Preloader";
import { Header } from "./components/Header";
import LogPose from "./components/LogPose";
import Hero from "./sections/Hero";
import GrandLine from "./sections/GrandLine";
import NewWorld from "./sections/NewWorld";
import SkyIslands from "./sections/SkyIslands";
import CaptainsLog from "./sections/CaptainsLog";
import CrewStories from "./sections/CrewStories";
import BountyBoard from "./sections/BountyBoard";
import Subdomains from "./sections/Subdomains";
import Footer from "./sections/Footer";

const sections = [
  { id: "reverse-mountain", label: "Start" },
  { id: "grand-line", label: "Challenges" },
  { id: "new-world", label: "Future" },
  { id: "sky-islands", label: "Power" },
  { id: "captains-log", label: "Blog" },
  { id: "crew-stories", label: "Stories" },
  { id: "bounty-board", label: "Bounties" },
  { id: "subdomains", label: "Products" },
];

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Preloader onComplete={() => setIsLoading(false)} />
      
      {!isLoading && (
        <main className="relative">
          {/* Fixed Navigation */}
          <Header />
          
          {/* Log Pose Compass Navigation */}
          <LogPose sections={sections} />
          
          {/* Page Sections */}
          <Hero />
          <GrandLine />
          <NewWorld />
          <SkyIslands />
          <CaptainsLog />
          <CrewStories />
          <BountyBoard />
          <Subdomains />
          <Footer />
        </main>
      )}
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
