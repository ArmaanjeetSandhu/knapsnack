import { ArrowLeft, ArrowRight, AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

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
        {hasExistingSession ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="w-full border-none bg-white/90 text-black transition-transform duration-150 hover:bg-white focus:outline-none focus-visible:scale-110 focus-visible:ring-0 sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to App
            </Button>

            <div
              className="relative flex flex-col items-center"
              data-startover-zone
            >
              {confirmingStartOver && (
                <>
                  <div className="absolute bottom-full left-1/2 mb-3 w-72 -translate-x-1/2 rounded-xl bg-white/95 px-4 py-3 text-left text-sm text-gray-800 shadow-xl backdrop-blur-sm sm:hidden">
                    <div className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p>
                        This will wipe all locally stored data (your{" "}
                        <strong>personal info</strong>,{" "}
                        <strong>added foods</strong>, and{" "}
                        <strong>optimised diet plan</strong>). This cannot be
                        undone.
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                      <div className="h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95" />
                    </div>
                  </div>

                  <div className="absolute left-full top-1/2 ml-3 hidden w-72 -translate-y-1/2 rounded-xl bg-white/95 px-4 py-3 text-left text-sm text-gray-800 shadow-xl backdrop-blur-sm sm:block">
                    <div className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <p>
                        This will wipe all locally stored data (your{" "}
                        <strong>personal info</strong>,{" "}
                        <strong>added foods</strong>, and{" "}
                        <strong>optimised diet plan</strong>). This cannot be
                        undone.
                      </p>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2">
                      <div className="h-0 w-0 border-b-8 border-r-8 border-t-8 border-b-transparent border-r-white/95 border-t-transparent" />
                    </div>
                  </div>
                </>
              )}

              <Button
                size="lg"
                data-startover-zone
                onClick={() => {
                  if (confirmingStartOver) onStartOver?.();
                  else setConfirmingStartOver(true);
                }}
                className={`w-full transition-all duration-150 focus:outline-none focus-visible:scale-110 focus-visible:ring-0 sm:w-auto ${
                  confirmingStartOver
                    ? "border-2 border-red-400 bg-red-500/90 text-white hover:bg-red-500"
                    : "border-2 border-white/70 bg-transparent text-white hover:bg-white/10"
                }`}
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
            className="hover:bg-white-800 animate-bounce border-none bg-white/90 text-black"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
