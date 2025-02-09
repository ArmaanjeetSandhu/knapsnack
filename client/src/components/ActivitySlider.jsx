import { useState, useEffect } from 'react';
import { Activity, Heart, Coffee, Briefcase, Dumbbell, Award } from 'lucide-react';
import PropTypes from 'prop-types';

const ActivitySlider = ({ value, onChange }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const categories = [
    { min: 1.2, max: 1.4, name: "Sedentary", icon: Coffee, color: "text-gray-600", examples: "office workers, drivers" },
    { min: 1.4, max: 1.6, name: "Light activity", icon: Briefcase, color: "text-green-600", examples: "teachers, retail workers" },
    { min: 1.6, max: 1.8, name: "Moderate activity", icon: Activity, color: "text-blue-600", examples: "construction workers, waiters" },
    { min: 1.8, max: 2.0, name: "Very active", icon: Dumbbell, color: "text-purple-600", examples: "athletes, dancers" },
    { min: 2.0, max: 2.4, name: "Extremely active", icon: Award, color: "text-red-600", examples: "competitive athletes, heavy manual laborers" }
  ];

  const getCurrentCategory = (val) => {
    return categories.find(cat => val >= cat.min && val < cat.max) || categories[categories.length - 1];
  };

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const currentCategory = getCurrentCategory(value);
  const progress = ((value - 1.2) / (2.4 - 1.2)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-medium">Activity Level</h3>
        </div>
        <span className="text-lg font-bold">{value.toFixed(1)}</span>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gray-400 via-blue-500 to-red-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>1.2</span>
          <span>2.4</span>
        </div>
      </div>

      <div className={`transform transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
        <div className={`p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 border ${currentCategory.color.replace('text', 'border')} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentCategory.color.replace('text', 'bg')} bg-opacity-20`}>
              <currentCategory.icon className={`w-5 h-5 ${currentCategory.color}`} />
            </div>
            <div>
              <h4 className={`text-base font-semibold ${currentCategory.color}`}>
                {currentCategory.name}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                Examples: {currentCategory.examples}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Range: {currentCategory.min.toFixed(1)} - {currentCategory.max.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`h-2 rounded-full transition-all duration-300 ${
              value >= cat.min && value <= cat.max 
                ? cat.color.replace('text-gray-600', 'bg-gray-500')
                  .replace('text-green-600', 'bg-green-500')
                  .replace('text-blue-600', 'bg-blue-500')
                  .replace('text-purple-600', 'bg-purple-500')
                  .replace('text-red-600', 'bg-red-500')
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

ActivitySlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default ActivitySlider;