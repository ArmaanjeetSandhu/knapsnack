import { useEffect } from "react";

import Footer from "../../common/Footer";

import CtaSection from "./CtaSection";
import DietsSection from "./DietsSection";
import FaqSection from "./FaqSection";
import FeaturesSection from "./FeaturesSection";
import InspirationsSection from "./InspirationsSection";
import IntroSection from "./IntroSection";
import OutroSection from "./OutroSection";
import ParadigmSection from "./ParadigmSection";

interface LandingDetailsProps {
  onGetStarted: () => void;
}

const LandingDetails = ({ onGetStarted }: LandingDetailsProps) => {
  useEffect(() => {
    document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <>
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
    </>
  );
};

export default LandingDetails;
