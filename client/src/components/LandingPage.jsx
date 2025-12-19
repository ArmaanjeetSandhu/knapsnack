import { ArrowRight } from "lucide-react";
import PropTypes from "prop-types";
import { Button } from "./ui/button";

const LandingPage = ({ onGetStarted }) => {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/background-fallback.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/background-fallback.png"
        className="absolute w-full h-full object-cover"
        style={{
          filter: "brightness(50%)",
          minWidth: "100%",
          minHeight: "100%",
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Knap[Snack]</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          The Cost-Optimized Meal Planner
        </p>
        <Button
          size="lg"
          onClick={onGetStarted}
          className="animate-bounce bg-white/90 text-black hover:bg-white-800 border-none"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

LandingPage.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
};

export default LandingPage;
