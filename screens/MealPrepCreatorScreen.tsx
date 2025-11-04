import React, { useState, useMemo, useEffect } from 'react';
import { Page, FoodSearchResult, PreppedMeal } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { BackIcon, PlusIcon, TrashIcon, SearchIcon, ChefHatIcon } from '../components/Icons';
import { searchFood } from '../services/geminiService';

const NutrientDisplay: React.FC<{ label: string; value: number; unit: string; color: string }> = ({ label, value, unit, color }) => (
    <div className="text-center">
        <p className={`text-2xl font-bold ${color}`}>{value.toFixed(0)}</p>
        <p className="text-xs text-text-light dark:text-dark-text-light">{label} ({unit})</p>
    </div>
);

const SearchModal: React.FC<{ 
    onClose: () => void;
    onSelectFood: (food: FoodSearchResult) => void;
}> = ({ onClose, onSelectFood }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }
        const handler = setTimeout(async () => {
            setIsLoading(true);
            try {
                const searchResults = await searchFood(query);
                setResults(searchResults);
            } catch (error) {
                console.error("Search failed in modal:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col animate-fade-in">
            <div className="bg-background dark:bg-dark-background p-4 flex flex-col h-full max-w-md mx-auto">
                <header className="flex items-center mb-4">
                     <button onClick={onClose} className="p-2 -ml-2">
                        <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                    </button>
                    <h2 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Add Ingredient</h2>
                    <div className="w-6"></div>
                </header>
                <div className="relative mb-4">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray"/>
                    <input type="text" placeholder="Search for food..." value={query} onChange={e => setQuery(e.target.value)} autoFocus className="w-full bg-card dark:bg-dark-card pl-11 pr-4 py-3 rounded-lg border border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center pt-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        results.map((item, index) => (
                             <div key={index} onClick={() => onSelectFood(item)} className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-light-gray dark:hover:bg-dark-card">
                                <img src={item.imageUrl || `https://placehold.co/40x40/E0F8F2/00C795?text=🍴`} alt={item.name} className="w-10 h-10 rounded-lg object-cover mr-4"/>
                                <div className="flex-1">
                                    <p className="font-semibold text-text-main dark:text-dark-text-main">{item.name}</p>
                                    <p className="text-xs text-text-light dark:text-dark-text-light">{item.calories} cal | P:{item.protein} C:{item.carbs} F:{item.fats}</p>
                                </div>
                                <PlusIcon className="w-6 h-6 text-primary" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const MealPrepCreatorScreen: React.FC = () => {
    const { navigateTo, handlePreppedMealAdd } = useAppContext();
    const [name, setName] = useState('');
    const [servings, setServings] = useState('1');
    const [ingredients, setIngredients] = useState<FoodSearchResult[]>([]);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    const nutritionPerServing = useMemo(() => {
        const numServings = parseInt(servings) || 1;
        if (ingredients.length === 0) {
            return { calories: 0, protein: 0, carbs: 0, fats: 0 };
        }
        
        const totals = ingredients.reduce((acc, item) => {
            acc.calories += item.calories;
            acc.protein += item.protein;
            acc.carbs += item.carbs;
            acc.fats += item.fats;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        return {
            calories: totals.calories / numServings,
            protein: totals.protein / numServings,
            carbs: totals.carbs / numServings,
            fats: totals.fats / numServings,
        };
    }, [ingredients, servings]);

    const handleAddIngredient = (food: FoodSearchResult) => {
        setIngredients(current => [...current, food]);
        setIsSearchModalOpen(false);
    };

    const handleRemoveIngredient = (indexToRemove: number) => {
        setIngredients(current => current.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveMeal = () => {
        if (!name.trim() || ingredients.length === 0) {
            alert('Please provide a name and add at least one ingredient.');
            return;
        }
        const numServings = parseInt(servings) || 1;
        const mealData: Omit<PreppedMeal, 'id'> = {
            name: name.trim(),
            servings: numServings,
            ingredients,
            caloriesPerServing: nutritionPerServing.calories,
            proteinPerServing: nutritionPerServing.protein,
            carbsPerServing: nutritionPerServing.carbs,
            fatsPerServing: nutritionPerServing.fats,
        };
        handlePreppedMealAdd(mealData);
        navigateTo(Page.LogMeal);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            {isSearchModalOpen && <SearchModal onClose={() => setIsSearchModalOpen(false)} onSelectFood={handleAddIngredient} />}
            <header className="flex items-center mb-4">
                <button onClick={() => navigateTo(Page.LogMeal)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Create Meal Prep</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm space-y-4">
                    <div>
                        <label htmlFor="mealName" className="text-sm font-semibold text-text-light dark:text-dark-text-light">Meal Name</label>
                        <input id="mealName" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Weekly Chicken & Rice" className="w-full mt-1 bg-light-gray dark:bg-dark-border p-3 rounded-lg focus:border-primary focus:ring-0 outline-none"/>
                    </div>
                     <div>
                        <label htmlFor="servings" className="text-sm font-semibold text-text-light dark:text-dark-text-light">Number of Servings</label>
                        <input id="servings" type="number" value={servings} onChange={e => setServings(e.target.value)} min="1" className="w-full mt-1 bg-light-gray dark:bg-dark-border p-3 rounded-lg focus:border-primary focus:ring-0 outline-none"/>
                    </div>
                </div>
                
                <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm text-center">
                    <h3 className="font-semibold text-text-main dark:text-dark-text-main mb-3">Nutrition per Serving</h3>
                    <div className="grid grid-cols-4 gap-2">
                        <NutrientDisplay label="Calories" value={nutritionPerServing.calories} unit="kcal" color="text-primary"/>
                        <NutrientDisplay label="Protein" value={nutritionPerServing.protein} unit="g" color="text-protein"/>
                        <NutrientDisplay label="Carbs" value={nutritionPerServing.carbs} unit="g" color="text-carbs"/>
                        <NutrientDisplay label="Fats" value={nutritionPerServing.fats} unit="g" color="text-fats"/>
                    </div>
                </div>
                
                <div className="bg-card dark:bg-dark-card p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-text-main dark:text-dark-text-main mb-3">Ingredients ({ingredients.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {ingredients.map((ing, index) => (
                            <div key={index} className="flex items-center p-2 rounded-lg bg-light-gray dark:bg-dark-border">
                                <img src={ing.imageUrl || ''} alt={ing.name} className="w-8 h-8 rounded-md object-cover mr-3"/>
                                <p className="flex-1 font-medium text-sm text-text-main dark:text-dark-text-main">{ing.name}</p>
                                <button onClick={() => handleRemoveIngredient(index)} className="p-1 text-medium-gray hover:text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setIsSearchModalOpen(true)} className="w-full mt-4 py-3 bg-primary-light dark:bg-primary/20 text-primary font-bold rounded-lg flex items-center justify-center">
                        <PlusIcon className="w-5 h-5 mr-2" /> Add Ingredient
                    </button>
                </div>
            </div>
            
            <div className="mt-4">
                <button onClick={handleSaveMeal} className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors">
                    Save Meal
                </button>
            </div>
        </div>
    );
};

export default MealPrepCreatorScreen;
