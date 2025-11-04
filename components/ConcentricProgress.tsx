
import React from 'react';
import { MacroGoals } from '../types';

interface ConcentricProgressProps {
  summary: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  calorieGoal: number;
  macroGoals: MacroGoals;
  caloriesBurned: number;
}

const ProgressCircle: React.FC<{
  radius: number;
  stroke: number;
  progress: number;
  color: string;
}> = ({ radius, stroke, progress, color }) => {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <g>
      <circle
        className="text-light-gray dark:text-dark-border"
        strokeWidth={stroke}
        stroke="currentColor"
        fill="transparent"
        r={normalizedRadius}
        cx={125}
        cy={125}
      />
      <circle
        className={color}
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        stroke="currentColor"
        fill="transparent"
        r={normalizedRadius}
        cx={125}
        cy={125}
        strokeLinecap="round"
      />
    </g>
  );
};

const ConcentricProgress: React.FC<ConcentricProgressProps> = ({ summary, calorieGoal, macroGoals, caloriesBurned }) => {
  const proteinProgress = macroGoals.protein > 0 ? (summary.protein / macroGoals.protein) * 100 : 0;
  const carbsProgress = macroGoals.carbs > 0 ? (summary.carbs / macroGoals.carbs) * 100 : 0;
  const fatsProgress = macroGoals.fats > 0 ? (summary.fats / macroGoals.fats) * 100 : 0;

  const remainingCalories = Math.round(calorieGoal + caloriesBurned - summary.calories);

  return (
    <div className="bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <div className="relative w-[250px] h-[250px]">
        <svg className="w-full h-full" viewBox="0 0 250 250">
          <ProgressCircle radius={110} stroke={18} progress={proteinProgress} color="text-protein" />
          <ProgressCircle radius={85} stroke={18} progress={carbsProgress} color="text-carbs" />
          <ProgressCircle radius={60} stroke={18} progress={fatsProgress} color="text-fats" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-4xl font-extrabold text-primary">{remainingCalories}</p>
          <p className="text-sm text-text-light dark:text-dark-text-light">Remaining</p>
        </div>
      </div>
      <div className="flex justify-around w-full mt-6">
        <div className="text-center">
            <p className="font-bold text-lg text-protein">{Math.round(summary.protein)}/{macroGoals.protein}g</p>
            <p className="text-xs text-text-light dark:text-dark-text-light">Protein</p>
        </div>
        <div className="text-center">
            <p className="font-bold text-lg text-carbs">{Math.round(summary.carbs)}/{macroGoals.carbs}g</p>
            <p className="text-xs text-text-light dark:text-dark-text-light">Carbs</p>
        </div>
        <div className="text-center">
            <p className="font-bold text-lg text-fats">{Math.round(summary.fats)}/{macroGoals.fats}g</p>
            <p className="text-xs text-text-light dark:text-dark-text-light">Fats</p>
        </div>
      </div>
    </div>
  );
};

export default ConcentricProgress;
