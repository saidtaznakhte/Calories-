import React, { useState, useMemo } from 'react';
import { Meal, Activity, Theme } from '../types';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import { formatWeight, getDisplayWeight } from '../utils/units';
import { getAIPersonalizedSuggestion } from '../services/geminiService';

const StatCard: React.FC<{ label: string; value?: string; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="bg-card dark:bg-dark-card p-4 rounded-2xl flex-1 shadow-sm">
        <p className="text-sm text-text-light dark:text-dark-text-light">{label}</p>
        {children ?? <p className="text-2xl font-bold text-text-main dark:text-dark-text-main">{value}</p>}
    </div>
);

const BmiIndicator: React.FC<{ category: string }> = ({ category }) => {
    const categoryStyles: { [key: string]: { dot: string; text: string; } } = {
        'Underweight': { dot: 'bg-fats', text: 'text-fats' },
        'Healthy': { dot: 'bg-primary', text: 'text-primary' },
        'Overweight': { dot: 'bg-secondary', text: 'text-secondary' },
        'Obese': { dot: 'bg-protein', text: 'text-protein' },
    };

    const styles = categoryStyles[category] || { dot: 'bg-medium-gray', text: 'text-medium-gray' };

    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`}></div>
            <span className={`text-sm font-semibold ${styles.text}`}>{category}</span>
        </div>
    );
};

const AISuggestionCard: React.FC<{
    suggestions: string[] | null;
    isLoading: boolean;
    error: string | null;
    onGenerate: () => void;
}> = ({ suggestions, isLoading, error, onGenerate }) => {
    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4 flex items-center">
                💡 AI-Powered Insights
            </h2>
            {isLoading ? (
                <div className="flex items-center justify-center h-24">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="ml-3 text-text-light dark:text-dark-text-light">Analyzing your week...</p>
                </div>
            ) : error ? (
                <div className="text-center py-4">
                    <p className="text-protein mb-3">{error}</p>
                    <button onClick={onGenerate} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg text-sm">
                        Try Again
                    </button>
                </div>
            ) : suggestions ? (
                <ul className="space-y-3">
                    {suggestions.map((s, i) => (
                        <li key={i} className="flex items-start">
                            <span className="text-primary mr-3 mt-1">✓</span>
                            <p className="text-text-main dark:text-dark-text-main text-sm">{s}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-4">
                    <p className="text-text-light dark:text-dark-text-light mb-4">Get personalized tips based on your weekly progress.</p>
                    <button onClick={onGenerate} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg">
                        Generate Insights
                    </button>
                </div>
            )}
        </div>
    );
};

const ReportsScreen: React.FC = () => {
    const { 
        loggedMeals, 
        theme,
        loggedActivities,
        weightHistory,
        goalWeight,
        currentWeight,
        profile,
        macroGoals,
    } = useAppContext();
    
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
    const [view, setView] = useState<'Nutrition' | 'Activity' | 'Weight'>('Nutrition');
    const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    
    const isDarkMode = theme === 'dark';
    const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
    const tooltipStyle = {
      backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0.5rem',
      border: `1px solid ${isDarkMode ? '#334151' : '#e5e7eb'}`,
      color: isDarkMode ? '#F8FAFC' : '#1E293B'
    };

    const handleGenerateSuggestion = async () => {
        setIsGenerating(true);
        setSuggestionError(null);
        setAiSuggestions(null);
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);
            const startDateString = toYYYYMMDD(startDate);

            const recentMeals = loggedMeals.filter(m => m.date >= startDateString);
            const daysWithMeals = new Set(recentMeals.map(m => m.date)).size || 1;
            const totalNutrition = recentMeals.reduce((acc, meal) => {
                acc.calories += meal.calories;
                acc.protein += meal.protein;
                acc.carbs += meal.carbs;
                acc.fats += meal.fats;
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

            const avgNutrition = {
                calories: totalNutrition.calories / daysWithMeals,
                protein: totalNutrition.protein / daysWithMeals,
                carbs: totalNutrition.carbs / daysWithMeals,
                fats: totalNutrition.fats / daysWithMeals,
            };
            
            const recentActivities = loggedActivities.filter(a => a.date >= startDateString);
            const daysWithActivity = new Set(recentActivities.map(a => a.date)).size || 1;
            const totalCaloriesBurned = recentActivities.reduce((sum, act) => sum + act.caloriesBurned, 0);
            const avgCaloriesBurned = totalCaloriesBurned / daysWithActivity;
            
            const calorieGoal = (macroGoals.protein * 4) + (macroGoals.carbs * 4) + (macroGoals.fats * 9);

            const suggestions = await getAIPersonalizedSuggestion({
                profile,
                macroGoals,
                calorieGoal,
                avgNutrition,
                avgCaloriesBurned,
            });
            setAiSuggestions(suggestions);
        } catch (err) {
            setSuggestionError('Sorry, I couldn\'t generate insights right now.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const nutritionData = useMemo(() => {
        const endDate = new Date();
        const numDays = timeframe === 'weekly' ? 7 : 30;
        
        const dateArray = Array.from({ length: numDays }, (_, i) => {
            const date = new Date();
            date.setDate(endDate.getDate() - i);
            return date;
        }).reverse();

        const chartData = dateArray.map(date => {
            const dateString = toYYYYMMDD(date);
            const mealsForDay = loggedMeals.filter(m => m.date === dateString);
            const dailySummary = mealsForDay.reduce((acc, meal) => {
                acc.calories += meal.calories;
                acc.protein += meal.protein;
                acc.carbs += meal.carbs;
                acc.fats += meal.fats;
                return acc;
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

            return {
                name: formatDate(date, { month: 'short', day: 'numeric' }),
                ...dailySummary
            };
        });

        const totalMacros = chartData.reduce((acc, day) => {
             acc.protein += day.protein;
             acc.carbs += day.carbs;
             acc.fats += day.fats;
             return acc;
        }, { protein: 0, carbs: 0, fats: 0 });

        const macroPieData = [
            { name: 'Protein', value: totalMacros.protein },
            { name: 'Carbs', value: totalMacros.carbs },
            { name: 'Fats', value: totalMacros.fats },
        ].filter(d => d.value > 0);

        return { chartData, macroPieData };
    }, [loggedMeals, timeframe]);

    const activityData = useMemo(() => {
        const endDate = new Date();
        const numDays = timeframe === 'weekly' ? 7 : 30;
        
        const dateArray = Array.from({ length: numDays }, (_, i) => {
            const date = new Date();
            date.setDate(endDate.getDate() - i);
            return date;
        }).reverse();

        const chartData = dateArray.map(date => {
            const dateString = toYYYYMMDD(date);
            const activitiesForDay = loggedActivities.filter(a => a.date === dateString);
            const caloriesBurned = activitiesForDay.reduce((sum, act) => sum + act.caloriesBurned, 0);
            return {
                name: formatDate(date, { month: 'short', day: 'numeric' }),
                caloriesBurned,
            };
        });

        const totalCaloriesBurned = chartData.reduce((sum, day) => sum + day.caloriesBurned, 0);

        return { chartData, totalCaloriesBurned };
    }, [loggedActivities, timeframe]);

    const weightData = useMemo(() => {
        const bmi = (currentWeight / (profile.height * profile.height)) * 703;
        const bmiCategory = (() => {
            if (bmi < 18.5) return 'Underweight';
            if (bmi < 25) return 'Healthy';
            if (bmi < 30) return 'Overweight';
            return 'Obese';
        })();

        const chartData = weightHistory.map(entry => ({
            date: formatDate(new Date(entry.date), { month: 'short', day: 'numeric' }),
            weight: getDisplayWeight(entry.weight, profile.unitSystem),
            goal: getDisplayWeight(goalWeight, profile.unitSystem)
        }));

        return {
            bmi: bmi.toFixed(1),
            bmiCategory,
            chartData
        };
    }, [weightHistory, currentWeight, goalWeight, profile]);
    

    const renderNutritionView = () => (
        <>
            <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Calorie Intake</h2>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <BarChart data={nutritionData.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(229, 231, 235, 0.4)'}} />
                            <Bar dataKey="calories" fill="#00C795" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Macronutrient Distribution</h2>
                {nutritionData.macroPieData.length > 0 ? (
                    <div style={{ width: '100%', height: 250 }} className="flex justify-center items-center text-text-main dark:text-dark-text-main">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={nutritionData.macroPieData} cx="50%" cy="50%"
                                    labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    fontSize={12}
                                >
                                    {nutritionData.macroPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#EF4444', '#FBBF24', '#3B82F6'][index]} />
                                    ))}
                                </Pie>
                                <Legend formatter={(value) => <span className="text-text-main dark:text-dark-text-main">{value}</span>} />
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-10 text-medium-gray dark:text-dark-gray"><p>No macronutrient data for this period.</p></div>
                )}
            </div>
        </>
    );
    
    const renderActivityView = () => (
        <>
             <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-4">Calories Burned</h2>
                <p className="text-3xl font-bold text-secondary">{activityData.totalCaloriesBurned} <span className="text-xl font-medium text-text-light dark:text-dark-text-light">kcal</span></p>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                        <BarChart data={activityData.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDarkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(229, 231, 235, 0.4)'}} />
                            <Bar dataKey="caloriesBurned" fill="#F97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );

    const renderWeightView = () => (
        <>
            <div className="flex gap-4">
                <StatCard label="Current Weight" value={formatWeight(currentWeight, profile.unitSystem)} />
                <StatCard label="BMI">
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-text-main dark:text-dark-text-main">{weightData.bmi}</p>
                        <BmiIndicator category={weightData.bmiCategory} />
                    </div>
                </StatCard>
            </div>
            <div className="bg-card dark:bg-dark-card p-4 rounded-2xl">
                <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-2">Weight Progress</h2>
                <div style={{ width: '100%', height: 250 }}>
                {weightData.chartData.length > 1 ? (
                    <ResponsiveContainer>
                        <LineChart data={weightData.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} />
                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} fontSize={12} tickLine={false} axisLine={false} stroke={axisColor} unit={profile.unitSystem === 'metric' ? ' kg' : ' lbs'} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="weight" name="Weight" stroke="#00C795" strokeWidth={2} />
                            <Line type="monotone" dataKey="goal" name="Goal" stroke="#F97316" strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-text-light dark:text-dark-text-light">
                        <p>Log your weight for a few days to see a chart.</p>
                    </div>
                )}
                </div>
            </div>
        </>
    );

    return (
        <div className="p-4 bg-background dark:bg-dark-background min-h-full">
            <h1 className="text-3xl font-bold text-text-main dark:text-dark-text-main mb-6 text-center">Progress</h1>
            
            <div className="flex p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6">
                <button onClick={() => setView('Nutrition')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${view === 'Nutrition' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}>Nutrition</button>
                <button onClick={() => setView('Activity')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${view === 'Activity' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}>Activity</button>
                <button onClick={() => setView('Weight')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${view === 'Weight' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}>Weight</button>
            </div>
            
            {(view === 'Nutrition' || view === 'Activity') && (
                <div className="flex justify-center p-1 bg-light-gray dark:bg-dark-border rounded-full mb-6">
                    <button onClick={() => setTimeframe('weekly')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${timeframe === 'weekly' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}>Weekly</button>
                    <button onClick={() => setTimeframe('monthly')} className={`w-full py-2 rounded-full text-sm font-semibold transition-colors ${timeframe === 'monthly' ? 'bg-card dark:bg-dark-card text-primary shadow' : 'text-text-light dark:text-dark-text-light'}`}>Monthly</button>
                </div>
            )}
            
            <div className="space-y-6 animate-fade-in">
                <AISuggestionCard 
                    suggestions={aiSuggestions}
                    isLoading={isGenerating}
                    error={suggestionError}
                    onGenerate={handleGenerateSuggestion}
                />
                
                {view === 'Nutrition' && renderNutritionView()}
                {view === 'Activity' && renderActivityView()}
                {view === 'Weight' && renderWeightView()}
            </div>
        </div>
    );
};

export default ReportsScreen;