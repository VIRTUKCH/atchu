import React from "react";
import LandingHero from "../components/landing/LandingHero";
import LandingProblemSection from "../components/landing/LandingProblemSection";
import LandingStrategySection from "../components/landing/LandingStrategySection";
import LandingTrustSection from "../components/landing/LandingTrustSection";
import LandingFilterSection from "../components/landing/LandingFilterSection";
import LandingStockExplore from "../components/landing/LandingStockExplore";
import LandingHowItWorks from "../components/landing/LandingHowItWorks";
import LandingDiscordCTA from "../components/landing/LandingDiscordCTA";

export default function MainPage() {
  return (
    <div className="landing-page">
      <LandingHero />
      <LandingProblemSection />
      <LandingStrategySection />
      <LandingTrustSection />
      <LandingFilterSection />
      <LandingStockExplore />
      <LandingHowItWorks />
      <LandingDiscordCTA />
    </div>
  );
}
