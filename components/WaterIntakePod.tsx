import React from 'react';

interface WaterIntakePodProps {
  currentIntake: number;
  goal: number;
  onAddWater: (amount: number) => void;
  style?: React.CSSProperties;
}

const WaterIntakePod: React.FC<WaterIntakePodProps> = ({ currentIntake, goal, onAddWater, style }) => {
  const percentage = goal > 0 ? Math.min((currentIntake / goal) * 100, 100) : 0;

  // The wave starts at the bottom (100%) and moves up to the top (0%)
  const fillPercentage = 100 - Math.min((currentIntake / goal) * 100, 100);

  return (
    <div className="bg-card dark:bg-slate-900/70 dark:backdrop-blur-sm dark:border dark:border-slate-700 rounded-2xl p-4 shadow-sm opacity-0 animate-fade-in" style={style}>
        <h2 className="text-lg font-semibold text-text-main dark:text-gray-100 mb-4">Hydration</h2>
        <div className="flex flex-col items-center">
            {/* The cup shape container */}
            <div 
                className="relative w-40 h-48 bg-light-gray dark:bg-slate-800/50 overflow-hidden border-4 border-b-8 border-white dark:border-slate-700 shadow-inner"
                style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }}
            >
                {/* The animated wave */}
                <div 
                    className="absolute bottom-0 left-0 w-full h-full transition-transform duration-1000 ease-in-out"
                    style={{ transform: `translateY(${fillPercentage}%)` }}
                >
                    <div className="bg-blue-400 absolute bottom-0 w-[200%] h-full opacity-50 animate-wave" style={{ animationDuration: '5s' }}>
                        <svg className="w-full h-auto absolute bottom-0" viewBox="0 0 1440 100" preserveAspectRatio="none">
                            <path d="M 0,50 C 360,100 720,0 1080,50 S 1800,100 1440,50 L 1440,100 L 0,100 Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div className="bg-blue-500 absolute bottom-0 w-[200%] h-full animate-wave">
                        <svg className="w-full h-auto absolute bottom-0" viewBox="0 0 1440 100" preserveAspectRatio="none">
                            <path d="M 0,50 C 360,0 720,100 1080,50 S 1800,0 1440,50 L 1440,100 L 0,100 Z" fill="currentColor"></path>
                        </svg>
                    </div>
                </div>

                {/* The text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white pointer-events-none p-2">
                    <span className="text-4xl font-bold drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]">{currentIntake}</span>
                    <span className="text-md text-white/80 drop-shadow-sm">/ {goal} fl oz</span>
                </div>
            </div>
            
            <p className="text-center font-bold text-lg text-blue-400 mt-4">{percentage.toFixed(0)}% Complete</p>

            <div className="flex justify-center space-x-4 mt-4">
                {[8, 12, 16].map(amount => (
                    <button 
                        key={amount}
                        onClick={() => onAddWater(amount)}
                        className="w-16 h-10 bg-blue-500/10 border border-blue-500/30 text-blue-500 dark:text-blue-300 font-bold rounded-full text-lg
                                   transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-blue-500/20"
                    >
                        +{amount}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default WaterIntakePod;
