import React, { useState, useMemo } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatWeight, getDisplayWeight } from '../utils/units';

const StatCard: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-2xl flex-1">
        <p className="text-sm text-text-light dark:text-dark-text-light">{label}</p>
        <p className="text-2xl font-bold text-text-main dark:text-dark-text-main">{value}</p>
    </div>
);

// A card to display macro progress, adapted for this screen
const MacroCard: React.FC<{ label: string; value: number; goal: number; color: string; }> = ({ label, value, goal, color }) => (
    <div className="bg-light-gray dark:bg-gray-700/50 p-4 rounded-xl flex-1">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-text-main dark:text-dark-text-main">{label}</span>
        </div>
        <p className="text-2xl font-bold text-text-main dark:text-dark-text-main">{value.toFixed(0)}<span className="text-sm text-text-light dark:text-dark-text-light"> / {goal}g</span></p>
        <div className="w-full bg-gray-200 dark:bg-dark-border rounded-full h-1.5 mt-2">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${goal > 0 ? Math.min((value / goal) * 100, 100) : 0}%` }}></div>
        </div>
    </div>
);


const ProgressScreen: React.FC = () => {
    const { loggedMeals, weightHistory, goalWeight, currentWeight, profile, theme, macroGoals } = useAppContext();
    const [view, setView] = useState<'Nutrition' | 'Activity' | 'Weight'>('Nutrition');

    const weeklyAverages = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = toYYYYMMDD(oneWeekAgo);

        const recentMeals = loggedMeals.filter(m => m.date >= oneWeekAgoStr);
        
        const totals = recentMeals.reduce((sum, meal) => {
            sum.calories += meal.calories;
            sum.protein += meal.protein;
            sum.carbs += meal.carbs;
            sum.fats += meal.fats;
            return sum;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const daysWithMeals = new Set(recentMeals.map(m => m.date)).size;

        if (daysWithMeals === 0) {
            return { calories: 0, protein: 0, carbs: 0, fats: 0 };
        }

        return {
            calories: Math.round(totals.calories / daysWithMeals),
            protein: Math.round(totals.protein / daysWithMeals),
            carbs: Math.round(totals.carbs / daysWithMeals),
            fats: Math.round(totals.fats / daysWithMeals),
        };
    }, [loggedMeals]);

    const calorieGoal = useMemo(() => (macroGoals.protein * 4) + (macroGoals.carbs * 4) + (macroGoals.fats * 9), [macroGoals]);
    
    const bmi = useMemo(() => {
        if (!currentWeight || !profile.height) return 0;
        // BMI = (weight in lbs / (height in inches)^2) * 703
        const bmiValue = (currentWeight / (profile.height * profile.height)) * 703;
        return bmiValue.toFixed(1);
    }, [currentWeight, profile.height]);
    
    const bmiCategory = useMemo(() => {
        const bmiVal = parseFloat(bmi);
        if (bmiVal < 18.5) return 'Underweight';
        if (bmiVal < 25) return 'Healthy';
        if (bmiVal < 30) return 'Overweight';
        return 'Obese';
    }, [bmi]);
    
    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#94A3B8' : '#64748B';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334155' : '#e5e7eb'}`,
      color: isDarkMode ? '#F1F5F9' : '#1E293B'
    };
    
    const weightChartData = weightHistory.map(entry => ({
        date: formatDate(new Date(entry.date), { month: 'short', day: 'numeric' }),
        weight: getDisplayWeight(entry.weight, profile.unitSystem),
        goal: getDisplayWeight(goalWeight, profile.unitSystem)
    }));

    const calorieGoalPercentage = calorieGoal > 0 ? Math.round((weeklyAverages.calories / calorieGoal) * 100) : 0;
    
    return (
        <div className="bg-background dark:bg-dark-background min-h-full">
            <header className="p-4 flex justify-between items-center">
                <button><ChevronLeftIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" /></button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main">Weekly Progress</h1>
                <button><CalendarIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" /></button>
            </header>

            <div className="p-4 space-y-4">
                <div className="bg-card dark:bg-dark-card p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-light dark:text-dark-text-light">Avg. Calorie Intake</p>
                        <p className="text-3xl font-bold text-text-main dark:text-dark-text-main">{weeklyAverages.calories} <span className="text-xl">/ {Math.round(calorieGoal)} kcal</span></p>
                        <p className="font-semibold text-primary">You're on track!</p>
                    </div>
                    <div className="relative w-20 h-20">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-light-gray dark:text-dark-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                            <path className="text-primary" strokeDasharray={`${calorieGoalPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" ></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-text-main dark:text-dark-text-main">{calorieGoalPercentage}%</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-dark-card p-4 rounded-2xl">
                    <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Macronutrient Averages</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <MacroCard label="Protein" value={weeklyAverages.protein} goal={macroGoals.protein} color="bg-protein" />
                        <MacroCard label="Carbs" value={weeklyAverages.carbs} goal={macroGoals.carbs} color="bg-carbs" />
                        <MacroCard label="Fats" value={weeklyAverages.fats} goal={macroGoals.fats} color="bg-fats" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <StatCard label="Current Weight" value={formatWeight(currentWeight, profile.unitSystem)} />
                    <StatCard label="BMI" value={`${bmi} (${bmiCategory})`} />
                </div>
                
                 <div className="bg-white dark:bg-dark-card p-4 rounded-2xl">
                     <p className="text-sm text-text-light dark:text-dark-text-light mb-2">Weight Progress (Last {weightHistory.length} entries)</p>
                     <div style={{ width: '100%', height: 200 }}>
                        {weightHistory.length > 1 ? (
                            <ResponsiveContainer>
                                <LineChart data={weightChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} unit={profile.unitSystem === 'metric' ? 'kg' : 'lbs'} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Line type="monotone" dataKey="weight" name="Weight" stroke="#00C795" strokeWidth={2} />
                                    <Line type="monotone" dataKey="goal" name="Goal" stroke="#F97316" strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-light dark:text-dark-text-light">
                                <p>Not enough data for a chart yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressScreen;
