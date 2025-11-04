
import React, { useState, useMemo } from 'react';
import { Page, Meal, MealType } from '../types';
// FIX: Removed duplicate import alias for ChevronRightIcon.
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, BellIcon, TrashIcon } from '../components/Icons';
import { toYYYYMMDD, formatDate } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';

const mealIcons: Record<MealType, string> = {
    [MealType.Breakfast]: '🥞',
    [MealType.Lunch]: '🥗',
    [MealType.Dinner]: '🍲',
    [MealType.Snacks]: '🍎',
};

const DiaryScreen: React.FC = () => {
    const { navigateTo, loggedMeals, viewMealDetail, handleMealRemoved, openRemindersModal } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const changeDate = (amount: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    };

    const handleDelete = (index: number) => {
        const mealToDelete = loggedMeals[index];
        if (mealToDelete && window.confirm(`Are you sure you want to delete "${mealToDelete.name}"?`)) {
            handleMealRemoved(index);
        }
    };

    const { mealsForDay, summary } = useMemo(() => {
        const dateString = toYYYYMMDD(selectedDate);
        const meals = loggedMeals
            .map((meal, originalIndex) => ({ ...meal, originalIndex }))
            .filter(meal => meal.date === dateString);
        
        const summary = meals.reduce((acc, meal) => {
            acc.calories += meal.calories;
            acc.protein += meal.protein;
            acc.carbs += meal.carbs;
            acc.fats += meal.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
        
        return { mealsForDay: meals, summary };
    }, [selectedDate, loggedMeals]);

    const groupedMeals = useMemo(() => {
        return mealsForDay.reduce((acc, meal) => {
            (acc[meal.type] = acc[meal.type] || []).push(meal);
            return acc;
        }, {} as Record<MealType, (Meal & { originalIndex: number })[]>);
    }, [mealsForDay]);

    return (
        <div className="bg-background dark:bg-dark-background min-h-full">
            <header className="bg-background dark:bg-dark-background p-4 sticky top-0 z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <button onClick={() => changeDate(-1)} className="p-2"><ChevronLeftIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" /></button>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-bold text-text-main dark:text-dark-text-main">{formatDate(selectedDate)}</h1>
                            <button onClick={openRemindersModal} className="p-1 text-text-light dark:text-dark-text-light hover:text-primary dark:hover:text-primary transition-colors">
                                <BellIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm text-text-light dark:text-dark-text-light">{selectedDate.getFullYear()}</p>
                    </div>
                    <button onClick={() => changeDate(1)} className="p-2"><ChevronRightIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" /></button>
                </div>
            </header>
            
            <div className="p-4 space-y-6">
                <div className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm flex justify-around text-center">
                    <div>
                        <p className="font-bold text-lg text-primary">{summary.calories}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Calories</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-protein">{summary.protein}g</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Protein</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-carbs">{summary.carbs}g</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Carbs</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg text-fats">{summary.fats}g</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light">Fats</p>
                    </div>
                </div>

                {Object.keys(groupedMeals).length === 0 ? (
                    <div className="text-center py-16 text-medium-gray dark:text-dark-gray">
                        <p className="text-lg mb-2">No meals logged for this day.</p>
                        <p>Tap the '+' button to add a meal.</p>
                    </div>
                ) : (
                    (Object.keys(MealType) as Array<keyof typeof MealType>).map(mealTypeKey => {
                        const type = MealType[mealTypeKey];
                        const meals = groupedMeals[type];
                        if (!meals || meals.length === 0) return null;
                        
                        const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

                        return (
                            <div key={type} className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-3">{mealIcons[type]}</span>
                                        <h2 className="text-lg font-semibold text-text-main dark:text-dark-text-main">{type}</h2>
                                    </div>
                                    <span className="font-semibold text-text-main dark:text-dark-text-main">{totalCalories} cal</span>
                                </div>
                                <div className="space-y-2 divide-y divide-light-gray dark:divide-dark-border">
                                    {meals.map((meal) => (
                                        <div 
                                            key={meal.originalIndex}
                                            className="flex items-center pt-2 w-full text-left first:pt-0"
                                        >
                                            <button 
                                                onClick={() => viewMealDetail(meal.originalIndex)}
                                                className="flex-1 flex items-center text-left p-2 -m-2 rounded-lg hover:bg-light-gray dark:hover:bg-dark-border"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-text-main dark:text-dark-text-main">{meal.name}</p>
                                                    <p className="text-sm text-text-light dark:text-dark-text-light">{meal.calories} cal</p>
                                                </div>
                                                <ChevronRightIcon className="w-5 h-5 text-medium-gray" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(meal.originalIndex)}
                                                className="p-2 ml-2 text-medium-gray hover:text-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                aria-label={`Delete ${meal.name}`}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <button
                onClick={() => navigateTo(Page.LogMeal)}
                className="fixed bottom-24 right-8 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default DiaryScreen;
