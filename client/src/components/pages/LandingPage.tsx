import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") onGetStarted();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGetStarted]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
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
        className="absolute h-full w-full object-cover"
        style={{
          filter: "brightness(55%)",
          minWidth: "100%",
          minHeight: "100%",
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="relative z-10 px-4 text-center text-white">
        <h1 className="no-select mb-6 text-5xl font-bold md:text-6xl">
          Knap[Snack]
        </h1>
        <p className="no-select mx-auto mb-8 max-w-2xl text-xl md:text-2xl">
          The Cost-Optimised Meal Planner
        </p>
        <Button
          size="lg"
          onClick={onGetStarted}
          className="hover:bg-white-800 animate-bounce border-none bg-white/90 text-black"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;
