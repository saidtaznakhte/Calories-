
import React, { useState, useMemo } from 'react';
import { Page, MealType, Meal } from '../types';
import { BellIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, ChefHatIcon, FlameIcon } from '../components/Icons';
import { toYYYYMMDD, formatDate, isToday, isYesterday } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';
import ConcentricProgress from '../components/ConcentricProgress';
import WaterIntakePod from '../components/WaterIntakePod';
import DateSelector from '../components/DateSelector';
import DailySummaryCard from '../components/DailySummaryCard';
import StreakCounter from '../components/StreakCounter';

const mealIcons: Record<MealType, string> = {
    [MealType.Breakfast]: '🥞',
    [MealType.Lunch]: '🥗',
    [MealType.Dinner]: '🍲',
    [MealType.Snacks]: '🍎',
};

const MealSummaryCard: React.FC<{
  mealType: MealType;
  meals: (Meal & { originalIndex: number })[];
  onMealClick: (index: number) => void;
}> = ({ mealType, meals, onMealClick }) => {
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    if (meals.length === 0) return null;

    return (
        <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm dark:border dark:border-dark-border">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                    <span className="text-2xl mr-3">{mealIcons[mealType]}</span>
                    <h3 className="text-lg font-semibold text-text-main dark:text-dark-text-main">{mealType}</h3>
                </div>
                <span className="font-semibold text-text-main dark:text-dark-text-main">{totalCalories} cal</span>
            </div>
            <div className="space-y-2">
                {meals.map((meal) => (
                    <button
                        key={meal.originalIndex}
                        onClick={() => onMealClick(meal.originalIndex)}
                        className="flex justify-between text-sm w-full text-left p-1 -m-1 rounded hover:bg-light-gray dark:hover:bg-dark-border"
                    >
                        <p className="text-text-light dark:text-dark-text-light">{meal.name}</p>
                        <p className="text-text-main dark:text-dark-text-main font-medium">{meal.calories} cal</p>
                    </button>
                ))}
            </div>
        </div>
    );
};


const DashboardScreen: React.FC = () => {
    const {
      navigateTo,
      loggedMeals,
      loggedActivities,
      profile,
      macroGoals,
      waterIntakeHistory,
      waterGoal,
      handleWaterIntakeUpdate,
      viewMealDetail,
      dayStreak,
    } = useAppContext();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [touchStartX, setTouchStartX] = useState(0);
    const [touchDeltaX, setTouchDeltaX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

    const dateString = toYYYYMMDD(selectedDate);
    const waterIntake = waterIntakeHistory[dateString] || 0;

    const { mealsForDay, summary, caloriesBurned } = useMemo(() => {
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
        
        const activitiesForDay = loggedActivities.filter(activity => activity.date === dateString);
        const caloriesBurned = activitiesForDay.reduce((sum, activity) => sum + activity.caloriesBurned, 0);

        return { mealsForDay: meals, summary, caloriesBurned };
    }, [selectedDate, loggedMeals, loggedActivities]);
    
    const calorieGoal = useMemo(() => (macroGoals.protein * 4) + (macroGoals.carbs * 4) + (macroGoals.fats * 9), [macroGoals]);

    const mealsByType = useMemo(() => {
      return mealsForDay.reduce((acc, meal) => {
        (acc[meal.type] = acc[meal.type] || []).push(meal);
        return acc;
      }, {} as Record<MealType, (Meal & { originalIndex: number })[]>);
    }, [mealsForDay]);

    const dateSubtext = useMemo(() => {
        if (isToday(selectedDate)) {
            return `Today, ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
        }
        if (isYesterday(selectedDate)) {
            return `Yesterday, ${formatDate(selectedDate, { month: 'long', day: 'numeric' })}`;
        }
        return formatDate(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' });
    }, [selectedDate]);
    
    const changeDay = (offset: number) => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX === 0) return;
        const currentX = e.touches[0].clientX;
        setTouchDeltaX(currentX - touchStartX);
    };

    const handleTouchEnd = () => {
        const swipeThreshold = 50; // pixels
        if (Math.abs(touchDeltaX) > swipeThreshold) {
            if (touchDeltaX > 0) {
                // Swipe Right (previous day)
                changeDay(-1);
            } else {
                // Swipe Left (next day)
                changeDay(1);
            }
        }
        
        setTouchStartX(0);
        setTouchDeltaX(0);
        setIsSwiping(false);
    };


  return (
    <div className="bg-background dark:bg-dark-background min-h-full overflow-x-hidden">
      <header className="p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-main dark:text-dark-text-main">Hello, {profile.name}!</h1>
          <p className="text-text-light dark:text-dark-text-light">{dateSubtext}</p>
        </div>
        <div className="flex items-center space-x-2">
            <StreakCounter streak={dayStreak} />
            <button className="relative p-2">
            <BellIcon className="w-6 h-6 text-text-light dark:text-dark-text-light" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-background dark:border-dark-background"></span>
            </button>
        </div>
      </header>
      
      <div className="p-4">
          <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-dark-card" aria-label="Previous day">
                  <ChevronLeftIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
              </button>
              <h3 className="font-bold text-lg text-text-main dark:text-dark-text-main" aria-live="polite">
                  {formatDate(selectedDate, { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-white dark:hover:bg-dark-card" aria-label="Next day">
                  <ChevronRightIcon className="w-5 h-5 text-text-main dark:text-dark-text-main" />
              </button>
          </div>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </div>
      
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
            transform: `translateX(${touchDeltaX}px)`,
            transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <div className="p-4 space-y-6">
            <DailySummaryCard 
                caloriesIn={summary.calories}
                caloriesOut={caloriesBurned}
                calorieGoal={calorieGoal}
            />

            <ConcentricProgress 
                summary={summary}
                calorieGoal={calorieGoal}
                macroGoals={macroGoals}
                caloriesBurned={caloriesBurned}
            />
                    
            <WaterIntakePod 
            currentIntake={waterIntake}
            goal={waterGoal}
            onAddWater={(amount) => handleWaterIntakeUpdate(dateString, waterIntake + amount)}
            />
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main">
                    Logged Meals
                </h2>

                {mealsForDay.length > 0 ? (
                    <div className="space-y-4">
                        <MealSummaryCard mealType={MealType.Breakfast} meals={mealsByType[MealType.Breakfast] || []} onMealClick={viewMealDetail} />
                        <MealSummaryCard mealType={MealType.Lunch} meals={mealsByType[MealType.Lunch] || []} onMealClick={viewMealDetail} />
                        <MealSummaryCard mealType={MealType.Dinner} meals={mealsByType[MealType.Dinner] || []} onMealClick={viewMealDetail} />
                        <MealSummaryCard mealType={MealType.Snacks} meals={mealsByType[MealType.Snacks] || []} onMealClick={viewMealDetail} />
                    </div>
                ) : (
                    <div className="text-center py-12 px-4 bg-card dark:bg-dark-card rounded-2xl shadow-sm">
                        <ChefHatIcon className="w-12 h-12 mx-auto text-medium-gray dark:text-dark-gray mb-4" />
                        <p className="font-semibold text-text-main dark:text-dark-text-main mb-1">Nothing Logged Yet</p>
                        <p className="text-text-light dark:text-dark-text-light mb-4 text-sm">Tap the plus button to add your first meal of the day.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
      <>
        {isFabMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/40 z-30 animate-fade-in"
                onClick={() => setIsFabMenuOpen(false)}
                aria-hidden="true"
            ></div>
        )}
        <div className="fixed bottom-24 right-6 z-40">
            <div className="flex flex-col items-end">
                <div className={`flex flex-col items-end gap-4 mb-4 transition-all duration-300 ease-in-out ${isFabMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    <div className="flex items-center gap-3">
                        <span className="bg-card dark:bg-dark-card text-sm text-text-main dark:text-dark-text-main font-semibold px-3 py-1 rounded-md shadow-md">Log Activity</span>
                        <button
                            onClick={() => { navigateTo(Page.LogActivity); setIsFabMenuOpen(false); }}
                            className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white shadow-lg"
                            aria-label="Log Activity"
                        >
                            <FlameIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="bg-card dark:bg-dark-card text-sm text-text-main dark:text-dark-text-main font-semibold px-3 py-1 rounded-md shadow-md">Log Meal</span>
                        <button
                            onClick={() => { navigateTo(Page.LogMeal); setIsFabMenuOpen(false); }}
                            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                            aria-label="Log Meal"
                        >
                            <ChefHatIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsFabMenuOpen(prev => !prev)}
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                    aria-label={isFabMenuOpen ? "Close actions menu" : "Open actions menu"}
                    aria-expanded={isFabMenuOpen}
                >
                    <PlusIcon className={`w-8 h-8 transition-transform duration-300 ${isFabMenuOpen ? 'rotate-45' : 'rotate-0'}`} />
                </button>
            </div>
        </div>
      </>
    </div>
  );
};

export default DashboardScreen;