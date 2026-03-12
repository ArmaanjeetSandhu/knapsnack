import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";

import BrandLogo from "../../common/BrandLogo";
import Footer from "../../common/Footer";
import ThemeToggle from "../../common/ThemeToggle";
import { Button } from "../../ui/button";

import CtaSection from "./CtaSection";
import DietsSection from "./DietsSection";
import FaqSection from "./FaqSection";
import FeaturesSection from "./FeaturesSection";
import InspirationsSection from "./InspirationsSection";
import IntroSection from "./IntroSection";
import OutroSection from "./OutroSection";
import ParadigmSection from "./ParadigmSection";

interface LandingPageProps {
  onGetStarted: () => void;
  hasExistingSession?: boolean;
  onStartOver?: () => void;
}

const LandingPage = ({
  onGetStarted,
  hasExistingSession,
  onStartOver,
}: LandingPageProps) => {
  const [confirmingStartOver, setConfirmingStartOver] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;
      const focused = document.activeElement as HTMLElement | null;
      if (focused && focused.tagName === "BUTTON") return;
      onGetStarted();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGetStarted]);

  useEffect(() => {
    if (!confirmingStartOver) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-startover-zone]"))
        setConfirmingStartOver(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmingStartOver]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen overflow-x-hidden scroll-smooth bg-background font-sans text-foreground">
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <ThemeToggle variant="landing" />
      </div>

      <section className="relative flex min-h-screen w-full flex-col items-center justify-center py-20">
        <div className="relative z-10 mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
          <BrandLogo variant="landing" />

          <div className="mt-8 flex flex-col items-center gap-6 sm:mt-10">
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="no-select text-lg text-muted-foreground sm:text-xl md:text-2xl"
              >
                The Cost-Optimised Meal Planner
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.05 }}
            >
              {hasExistingSession ? (
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Button
                    size="lg"
                    onClick={onGetStarted}
                    className="w-full px-6 py-6 text-base transition-transform duration-150 focus-visible:scale-105 sm:w-auto sm:px-8 sm:text-lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to App
                  </Button>

                  <div
                    className="relative flex w-full flex-col items-center sm:w-auto"
                    data-startover-zone
                  >
                    {confirmingStartOver && (
                      <div className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 sm:bottom-auto sm:left-full sm:top-1/2 sm:ml-4 sm:-translate-y-1/2 sm:translate-x-0">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative w-[280px] rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground shadow-xl sm:w-72"
                        >
                          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-border bg-card sm:hidden" />
                          <div className="absolute -left-1.5 top-1/2 hidden h-3 w-3 -translate-y-1/2 rotate-45 rounded-[2px] border-b border-l border-border bg-card sm:block" />
                          <div className="relative z-10 flex gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                            <p>
                              All locally stored data (your{" "}
                              <strong>personal info</strong>,{" "}
                              <strong>added foods</strong>, and{" "}
                              <strong>diet plans</strong>) will be wiped. This
                              cannot be undone.
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    )}
                    <Button
                      size="lg"
                      variant={confirmingStartOver ? "destructive" : "outline"}
                      onClick={() => {
                        if (confirmingStartOver) onStartOver?.();
                        else setConfirmingStartOver(true);
                      }}
                      className="w-full px-6 py-6 text-base transition-transform duration-150 focus-visible:scale-105 sm:w-auto sm:px-8 sm:text-lg"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      {confirmingStartOver ? "Are you sure?" : "Start Over"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="group w-full px-6 py-6 text-base sm:w-auto sm:px-8 sm:text-lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        <motion.button
          onClick={() => scrollToSection("intro")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="absolute bottom-6 flex flex-col items-center text-muted-foreground transition-colors hover:text-foreground sm:bottom-10"
        >
          <span className="no-select mb-2 text-xs font-medium sm:text-sm">
            Learn More
          </span>
          <ChevronDown className="h-5 w-5 animate-bounce sm:h-6 sm:w-6" />
        </motion.button>
      </section>

      <IntroSection />
      <FeaturesSection />
      <DietsSection />
      <ParadigmSection />
      <FaqSection />
      <CtaSection onGetStarted={onGetStarted} />
      <OutroSection />

      <div className="mb-12">
        <InspirationsSection />
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
