import React from 'react';
import { FlameIcon } from './Icons';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => {
    if (streak === 0) {
        return null;
    }

    return (
        <div className="flex items-center space-x-1 bg-secondary/10 dark:bg-secondary/20 px-3 py-1.5 rounded-full">
            <FlameIcon className="w-5 h-5 text-secondary" />
            <span className="font-bold text-secondary text-md">{streak}</span>
        </div>
    );
};

export default StreakCounter;
