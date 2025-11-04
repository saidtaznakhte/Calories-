import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Page, MealType, FoodSearchResult, Meal, FoodCategory, PreppedMeal } from '../types';
import { BackIcon, CameraIcon, SearchIcon, BarcodeIcon, PlusIcon, StarIcon, ChefHatIcon, TrashIcon, ChevronRightIcon, EditIcon, XIcon } from '../components/Icons';
import { searchFood } from '../services/geminiService';
import { toYYYYMMDD } from '../utils/dateUtils';
import { useAppContext } from '../contexts/AppContext';
import { popularFoods } from '../data/foodData';

const getDefaultMealType = (): MealType => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) return MealType.Breakfast;
    if (currentHour >= 11 && currentHour < 16) return MealType.Lunch;
    if (currentHour >= 16 && currentHour < 22) return MealType.Dinner;
    return MealType.Snacks;
};

const MealTypeFilter: React.FC<{
  selectedType: MealType;
  onSelectType: (type: MealType) => void;
}> = ({ selectedType, onSelectType }) => {
  const mealTypes = Object.values(MealType);
  return (
    <div className="flex space-x-3 overflow-x-auto pb-3 -mx-4 px-4">
      {mealTypes.map(type => (
        <button
          key={type}
          onClick={() => onSelectType(type)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            selectedType === type
              ? 'bg-primary text-white shadow'
              : 'bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};


const FoodCategoryFilter: React.FC<{
  selectedCategory: FoodCategory;
  onSelectCategory: (category: FoodCategory) => void;
}> = ({ selectedCategory, onSelectCategory }) => {
  const categories = Object.values(FoodCategory);
  return (
    <div className="flex space-x-3 overflow-x-auto pb-3 -mx-4 px-4">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            selectedCategory === category
              ? 'bg-primary text-white shadow'
              : 'bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};


const MacroPill: React.FC<{ label: string; value: number; color: string; }> = ({ label, value, color }) => (
    <div className="flex items-center space-x-1.5">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <p className="text-xs text-text-light dark:text-dark-text-light">{label} {Math.round(value)}g</p>
    </div>
);

const SearchResultItem: React.FC<{ 
    item: FoodSearchResult; 
    onSelect: (item: FoodSearchResult) => void;
    isFavorite: boolean;
    onToggleFavorite: (item: FoodSearchResult) => void;
}> = ({ item, onSelect, isFavorite, onToggleFavorite }) => {
    return (
        <div onClick={() => onSelect(item)} className="flex items-start p-3 bg-card dark:bg-dark-card rounded-2xl cursor-pointer hover:shadow-md transition-shadow dark:border dark:border-transparent dark:hover:border-primary/20">
            <img 
                src={item.imageUrl || `https://placehold.co/64x64/E0F8F2/00C795?text=🍴`}
                alt={item.name} 
                className="w-16 h-16 rounded-lg object-cover mr-4 flex-shrink-0 bg-light-gray"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                    <p className="font-bold text-text-main dark:text-dark-text-main mb-1 pr-2">{item.name}</p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item);
                        }}
                        className="p-1 -mt-1 -mr-1 text-medium-gray dark:text-dark-gray transition-colors flex-shrink-0"
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <StarIcon filled={isFavorite} className={`w-6 h-6 ${isFavorite ? 'text-carbs' : 'hover:text-carbs/70'}`} />
                    </button>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-text-light dark:text-dark-text-light truncate">{item.description || 'Nutritional Info'}</p>
                        <div className="flex items-center space-x-3 mt-2">
                            <MacroPill label="P" value={item.protein} color="bg-protein" />
                            <MacroPill label="C" value={item.carbs} color="bg-carbs" />
                            <MacroPill label="F" value={item.fats} color="bg-fats" />
                        </div>
                    </div>
                    <div className="text-right ml-2">
                        <p className="font-extrabold text-primary text-2xl">{Math.round(item.calories)}</p>
                        <p className="text-xs text-text-light dark:text-dark-text-light -mt-1">kcal</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LogMealScreen: React.FC = () => {
    const { 
        navigateTo, 
        handleMealLogged, 
        preppedMeals, 
        handlePreppedMealLogged, 
        recentFoods, 
        addFoodToRecents,
        favoriteFoods,
        toggleFavoriteFood,
    } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType>(getDefaultMealType());
    const [activeCategory, setActiveCategory] = useState<FoodCategory>(FoodCategory.All);
    const hasSearched = useRef(false);
    
    const foodList = useMemo(() => {
        if (activeCategory === FoodCategory.All) return popularFoods;
        if (activeCategory === FoodCategory.MealPrep) return [];
        return popularFoods.filter(food => food.category === activeCategory);
    }, [activeCategory]);
    
    const isFavorited = (food: FoodSearchResult) => 
        favoriteFoods.some(fav => fav.name.toLowerCase() === food.name.toLowerCase());

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (query.length < 3) {
            setSearchResults([]);
            hasSearched.current = false;
            return;
        }
        const handler = setTimeout(async () => {
            setIsSearching(true);
            hasSearched.current = true;
            try {
                const results = await searchFood(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleLogFood = (food: FoodSearchResult) => {
        addFoodToRecents(food);
        const meal: Meal = {
            ...food,
            type: selectedMealType,
            date: toYYYYMMDD(new Date()),
        };
        handleMealLogged(meal);
    };
    
    const handleLogPreppedMeal = (meal: PreppedMeal) => {
        handlePreppedMealLogged({
            meal,
            servings: 1,
            mealType: selectedMealType,
            date: toYYYYMMDD(new Date()),
        });
    }

    return (
        <div className="p-4 flex flex-col h-full bg-background dark:bg-dark-background">
            <header className="flex items-center mb-4">
                <button onClick={() => navigateTo(Page.Dashboard)} className="p-2 -ml-2">
                    <BackIcon className="w-6 h-6 text-text-main dark:text-dark-text-main" />
                </button>
                <h1 className="text-xl font-bold text-text-main dark:text-dark-text-main mx-auto">Log Meal</h1>
                <div className="w-6"></div>
            </header>

            <div className="flex space-x-2 mb-4">
                <button onClick={() => navigateTo(Page.Camera)} className="flex-1 flex items-center justify-center py-3 bg-card dark:bg-dark-card rounded-lg shadow-sm">
                    <CameraIcon className="w-5 h-5 mr-2 text-primary"/>
                    <span className="font-semibold text-sm text-text-main dark:text-dark-text-main">Snap Meal</span>
                </button>
                <button onClick={() => navigateTo(Page.BarcodeScanner)} className="flex-1 flex items-center justify-center py-3 bg-card dark:bg-dark-card rounded-lg shadow-sm">
                    <BarcodeIcon className="w-5 h-5 mr-2 text-primary"/>
                    <span className="font-semibold text-sm text-text-main dark:text-dark-text-main">Scan Code</span>
                </button>
                 <button onClick={() => navigateTo(Page.ManualLog)} title="Manual Entry" className="flex items-center justify-center p-3 bg-card dark:bg-dark-card rounded-lg shadow-sm aspect-square">
                    <EditIcon className="w-5 h-5 text-primary"/>
                </button>
                 <button onClick={() => navigateTo(Page.MealPrepCreator)} title="Meal Prep" className="flex items-center justify-center p-3 bg-card dark:bg-dark-card rounded-lg shadow-sm aspect-square">
                    <ChefHatIcon className="w-5 h-5 text-primary"/>
                </button>
            </div>

            <div className="relative mb-4">
                {isSearching ? (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-medium-gray border-t-primary rounded-full animate-spin"></div>
                ) : (
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-medium-gray"/>
                )}
                <input 
                    type="text" placeholder="Search for food, brand..."
                    className="w-full bg-card dark:bg-dark-card text-text-main dark:text-dark-text-main dark:placeholder-dark-text-light pl-11 pr-12 py-3 rounded-lg border border-light-gray dark:border-dark-border focus:border-primary focus:ring-0 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && !isSearching && (
                    <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-medium-gray hover:text-text-main dark:hover:text-dark-text-main"
                        aria-label="Clear search"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            <div className="mb-4">
              <MealTypeFilter selectedType={selectedMealType} onSelectType={setSelectedMealType} />
            </div>
            
            <FoodCategoryFilter selectedCategory={activeCategory} onSelectCategory={setActiveCategory} />
            
            <div className="flex-1 overflow-y-auto mt-4 space-y-3">
                {hasSearched.current && !isSearching && searchResults.length === 0 ? (
                    <div className="text-center py-10 px-4 text-medium-gray dark:text-dark-gray">
                        <p className="font-semibold text-text-main dark:text-dark-text-main">No Results Found</p>
                        <p className="text-sm mt-1">We couldn't find any food matching "{searchQuery}".</p>
                    </div>
                ) : searchResults.length > 0 ? (
                    searchResults.map((food, index) => <SearchResultItem key={index} item={food} onSelect={handleLogFood} isFavorite={isFavorited(food)} onToggleFavorite={toggleFavoriteFood} />)
                ) : (
                    <>
                        {recentFoods.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-text-main dark:text-dark-text-main mb-2">Recent</h2>
                                <div className="space-y-3">
                                    {recentFoods.map((food, index) => <SearchResultItem key={`recent-${index}`} item={food} onSelect={handleLogFood} isFavorite={isFavorited(food)} onToggleFavorite={toggleFavoriteFood} />)}
                                </div>
                                <hr className="border-light-gray dark:border-dark-border mt-4"/>
                            </div>
                        )}

                        {activeCategory === FoodCategory.MealPrep && preppedMeals.map(prep => (
                            <div key={prep.id} onClick={() => handleLogPreppedMeal(prep)} className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-light-gray dark:hover:bg-dark-card">
                                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mr-4">
                                    <ChefHatIcon className="w-6 h-6 text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-text-main dark:text-dark-text-main">{prep.name}</p>
                                    <p className="text-xs text-text-light dark:text-dark-text-light">{prep.caloriesPerServing} cal / serving</p>
                                </div>
                                <PlusIcon className="w-6 h-6 text-primary" />
                            </div>
                        ))}
                        {foodList.map((food, index) => <SearchResultItem key={index} item={food} onSelect={handleLogFood} isFavorite={isFavorited(food)} onToggleFavorite={toggleFavoriteFood} />)}
                    </>
                )}
            </div>
        </div>
    );
};

export default LogMealScreen;