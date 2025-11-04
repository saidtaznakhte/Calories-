import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BackIcon, TrashIcon } from '../components/Icons';
import { Page } from '../types';
import { formatDate } from '../utils/dateUtils';

const NutrientPill: React.FC<{ label: string; value: string | number; unit: string; color: string }> = ({ label, value, unit, color }) => (
    <div className="flex flex-col items-center justify-center bg-light-gray dark:bg-dark-border p-3 rounded-xl text-center flex-1">
        <span className={`text-xl font-bold ${color}`}>{value}</span>
        <span className="text-sm text-text-light dark:text-dark-text-light">{label}</span>
        <span className="text-xs text-medium-gray dark:text-dark-gray">{unit}</span>
    </div>
);

const MealDetailScreen: React.FC = () => {
    const { 
        navigateTo, 
        selectedMeal,
        handleMealRemovedAndNavigate,
        page, // Destructure page from context
    } = useAppContext();

    // This useEffect acts as a safeguard. If the user somehow lands on this
    // page without a selected meal, it navigates them back to the diary.
    // The check for `page === Page.MealDetail` prevents a race condition
    // during meal deletion where this would fire a conflicting navigation command.
    React.useEffect(() => {
        if (!selectedMeal && page === Page.MealDetail) {
            navigateTo(Page.Diary);
        }
    }, [selectedMeal, navigateTo, page]);
    
    if (!selectedMeal) {
        return <div className="p-4 bg-background dark:bg-dark-background h-full">Loading meal details or redirecting...</div>;
    }

    const { meal, index } = selectedMeal;

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${meal.name}"?`)) {
            handleMealRemovedAndNavigate(index, Page.Diary);
        }
    };
    
    const goBack = () => {
        navigateTo(Page.Diary);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={goBack} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Meal Details</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-6">
                 <div>
                    <p className="text-sm text-text-light dark:text-dark-text-light">{meal.type} &bull; {formatDate(new Date(meal.date + 'T00:00:00'), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <h2 className="text-3xl font-bold text-text-main dark:text-dark-text-main">{meal.name}</h2>
                </div>

                <div className="text-center">
                    <p className="text-6xl font-extrabold text-primary">{meal.calories}</p>
                    <p className="text-lg text-text-light dark:text-dark-text-light">Total Calories</p>
                </div>

                <div className="flex gap-4 justify-center">
                    <NutrientPill label="Protein" value={meal.protein} unit="g" color="text-protein" />
                    <NutrientPill label="Carbs" value={meal.carbs} unit="g" color="text-carbs" />
                    <NutrientPill label="Fats" value={meal.fats} unit="g" color="text-fats" />
                </div>

                {(meal.fiber || meal.sugar || meal.sodium) && (
                    <div>
                        <h3 className="text-lg font-semibold text-text-main dark:text-dark-text-main mb-3">Additional Info</h3>
                        <div className="grid grid-cols-3 gap-4 text-center bg-light-gray dark:bg-dark-border p-4 rounded-xl">
                            <div>
                                <p className="font-bold text-text-main dark:text-dark-text-main">{meal.fiber ?? 'N/A'}</p>
                                <p className="text-xs text-text-light dark:text-dark-text-light">Fiber (g)</p>
                            </div>
                            <div>
                                <p className="font-bold text-text-main dark:text-dark-text-main">{meal.sugar ?? 'N/A'}</p>
                                <p className="text-xs text-text-light dark:text-dark-text-light">Sugar (g)</p>
                            </div>
                            <div>
                                <p className="font-bold text-text-main dark:text-dark-text-main">{meal.sodium ?? 'N/A'}</p>
                                <p className="text-xs text-text-light dark:text-dark-text-light">Sodium (mg)</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-6">
                <button 
                    onClick={handleDelete}
                    className="w-full flex items-center justify-center bg-red-100 dark:bg-red-500/20 text-red-500 font-bold py-4 rounded-xl text-lg hover:bg-red-200/70 dark:hover:bg-red-500/30 transition-colors"
                >
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Delete Meal
                </button>
            </div>
        </div>
    );
};

export default MealDetailScreen;
