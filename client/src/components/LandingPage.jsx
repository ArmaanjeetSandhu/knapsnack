import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import PropTypes from 'prop-types';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="relative">
      <div className="relative h-screen">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            Goal-ith: The Smart Diet Optimizer
          </h1>
          <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
            Create personalized, nutritionally complete meal plans that fit your budget using advanced optimization techniques
          </p>
          <div className="space-y-4 text-center">
            <h2 className="text-lg md:text-xl font-semibold">Features:</h2>
            <ul className="space-y-2">
              <li>• Personalized nutrition goals based on your profile</li>
              <li>• Cost-optimized meal planning</li>
              <li>• Complete vitamin and mineral tracking</li>
              <li>• Scientific calculations using RDAs and ULs</li>
            </ul>
          </div>
          <Button
            size="lg"
            className="mt-8"
            onClick={onGetStarted}
          >
            Get Started
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
LandingPage.propTypes = {
  onGetStarted: PropTypes.func.isRequired,
};

export default LandingPage;