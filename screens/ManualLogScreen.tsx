import React, { useState } from 'react';
import { Page, Meal, MealType } from '../types';
import { BackIcon } from '../components/Icons';
import { useAppContext } from '../contexts/AppContext';
import { toYYYYMMDD } from '../utils/dateUtils';

const InputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    placeholder?: string;
    unit?: string;
}> = ({ label, name, value, onChange, type = 'text', placeholder, unit }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">{label}</label>
        <div className="relative">
            <input 
                id={name} 
                name={name} 
                type={type} 
                value={value} 
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none"
                required
            />
            {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light dark:text-dark-text-light">{unit}</span>}
        </div>
    </div>
);


const ManualLogScreen: React.FC = () => {
    const { navigateTo, handleMealLogged } = useAppContext();
    const [meal, setMeal] = useState({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        type: MealType.Snacks,
    });
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow only numbers for nutrient fields
        if (['calories', 'protein', 'carbs', 'fats'].includes(name)) {
            if (/^\d*\.?\d*$/.test(value)) {
                 setMeal(prev => ({ ...prev, [name]: value }));
            }
        } else {
             setMeal(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMeal(prev => ({ ...prev, type: e.target.value as MealType }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, calories, protein, carbs, fats, type } = meal;
        if (!name || !calories || !protein || !carbs || !fats) {
            alert('Please fill out all fields.');
            return;
        }

        const newMeal: Meal = {
            name,
            calories: parseFloat(calories),
            protein: parseFloat(protein),
            carbs: parseFloat(carbs),
            fats: parseFloat(fats),
            type,
            date: toYYYYMMDD(new Date()),
        };
        
        handleMealLogged(newMeal);
    };

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-6">
                <button onClick={() => navigateTo(Page.LogMeal)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Manual Entry</h1>
                <div className="w-6"></div>
            </header>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="bg-card dark:bg-dark-card rounded-2xl p-6 shadow-sm space-y-5">
                    <InputField 
                        label="Food Name"
                        name="name"
                        value={meal.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Apple"
                    />
                    
                    <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-text-light dark:text-dark-text-light mb-2">Meal</label>
                        <select 
                            id="type" 
                            name="type" 
                            value={meal.type} 
                            onChange={handleSelectChange} 
                            className="w-full bg-light-gray dark:bg-dark-border text-text-main dark:text-dark-text-main p-3 rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 outline-none"
                        >
                            {Object.values(MealType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            label="Calories"
                            name="calories"
                            value={meal.calories}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="0"
                            unit="kcal"
                        />
                         <InputField 
                            label="Protein"
                            name="protein"
                            value={meal.protein}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="0"
                            unit="g"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField 
                            label="Carbs"
                            name="carbs"
                            value={meal.carbs}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="0"
                            unit="g"
                        />
                         <InputField 
                            label="Fats"
                            name="fats"
                            value={meal.fats}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="0"
                            unit="g"
                        />
                    </div>
                </div>
            </form>
            
            <div className="mt-6">
                <button 
                    onClick={handleSubmit} 
                    className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg shadow-md hover:bg-primary/90 transition-colors"
                >
                    Log Meal
                </button>
            </div>
        </div>
    );
};

export default ManualLogScreen;