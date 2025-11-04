import React, { useState, useMemo } from 'react';
import { Page, MacroGoals } from '../types';
import { BackIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import { calculateGoals } from '../utils/nutritionUtils';

const MacroSlider: React.FC<{
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    color: string;
}> = ({ label, value, onChange, min, max, color }) => (
    <div className="mb-6">
        <div className="flex justify-between items-baseline mb-2">
            <label className="text-lg font-semibold text-text-main dark:text-dark-text-main">{label}</label>
            <span className="font-bold text-lg text-text-main dark:text-dark-text-main">{value}g</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={onChange}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${color}`}
            style={{ accentColor: `var(--color-${color.replace('bg-','')})` }}
        />
    </div>
);

const AdjustMacrosScreen: React.FC = () => {
    const { navigateTo, macroGoals: currentGoals, handleMacrosUpdate: onSave, profile, currentWeight } = useAppContext();
    const [goals, setGoals] = useState(currentGoals);

    const totalCalories = useMemo(() => {
        return (goals.protein * 4) + (goals.carbs * 4) + (goals.fats * 9);
    }, [goals]);

    const handleReset = () => {
        const recommendedGoals = calculateGoals(profile, currentWeight);
        setGoals(recommendedGoals);
    };

    const handleSave = () => {
        onSave(goals);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => navigateTo(Page.Settings)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Adjust Macronutrients</h1>
                <div className="w-6"></div>
            </header>
            
            <div className="flex-1 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm">
                <div className="text-center mb-8">
                    <p className="text-sm text-text-light dark:text-dark-text-light">Total Calorie Goal</p>
                    <p className="text-5xl font-extrabold text-primary">{Math.round(totalCalories)}</p>
                    <p className="text-sm text-text-light dark:text-dark-text-light">calories</p>
                </div>
                
                <MacroSlider 
                    label="Protein"
                    value={goals.protein}
                    onChange={(e) => setGoals(g => ({...g, protein: parseInt(e.target.value)}))}
                    min={20}
                    max={300}
                    color="bg-protein"
                />
                <MacroSlider 
                    label="Carbohydrates"
                    value={goals.carbs}
                    onChange={(e) => setGoals(g => ({...g, carbs: parseInt(e.target.value)}))}
                    min={20}
                    max={500}
                    color="bg-carbs"
                />
                <MacroSlider 
                    label="Fats"
                    value={goals.fats}
                    onChange={(e) => setGoals(g => ({...g, fats: parseInt(e.target.value)}))}
                    min={10}
                    max={200}
                    color="bg-fats"
                />
            </div>
            
             <div className="mt-6">
                <button 
                    onClick={handleReset} 
                    className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main font-bold py-3 rounded-xl text-lg mb-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                    Reset to Recommended
                </button>
                <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default AdjustMacrosScreen;
