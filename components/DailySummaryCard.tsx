import React from 'react';
import { FlameIcon } from './Icons';

interface DailySummaryCardProps {
  caloriesIn: number;
  caloriesOut: number;
  calorieGoal: number;
}

const StatItem: React.FC<{ label: string; value: number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex flex-col items-center w-20">
        <div className="flex items-center text-sm text-text-light dark:text-dark-text-light whitespace-nowrap">
            {icon && <div className="mr-1.5">{icon}</div>}
            <span>{label}</span>
        </div>
        <p className="text-2xl font-bold text-text-main dark:text-dark-text-main truncate">{Math.round(value)}</p>
    </div>
);

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ caloriesIn, caloriesOut }) => {
    const netCalories = caloriesIn - caloriesOut;

    return (
        <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm flex justify-around items-center">
            <StatItem label="Consumed" value={caloriesIn} />
            <div className="text-4xl font-light text-light-gray dark:text-dark-border">-</div>
            <StatItem label="Burned" value={caloriesOut} icon={<FlameIcon className="w-4 h-4 text-secondary" />} />
            <div className="text-4xl font-light text-light-gray dark:text-dark-border">=</div>
            <div className="flex flex-col items-center w-20">
                <span className="text-sm text-text-light dark:text-dark-text-light">Net</span>
                <p className="text-2xl font-bold text-primary truncate">{Math.round(netCalories)}</p>
            </div>
        </div>
    );
};

export default DailySummaryCard;
