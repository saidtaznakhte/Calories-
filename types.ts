

export enum Page {
  Dashboard = 'DASHBOARD',
  Diary = 'DIARY',
  Reports = 'REPORTS',
  Settings = 'SETTINGS',
  LogMeal = 'LOG_MEAL',
  Camera = 'CAMERA',
  BarcodeScanner = 'BARCODE_SCANNER',
  AdjustMacros = 'ADJUST_MACROS',
  WeightGoals = 'WEIGHT_GOALS',
  WeightHistory = 'WEIGHT_HISTORY',
  WaterHistory = 'WATER_HISTORY',
  Profile = 'PROFILE',
  LogActivity = 'LOG_ACTIVITY',
  ManualLog = 'MANUAL_LOG',
  MealPrepCreator = 'MEAL_PREP_CREATOR',
  MealDetail = 'MEAL_DETAIL',
}

export enum MealType {
    Breakfast = 'Breakfast',
    Lunch = 'Lunch',
    Dinner = 'Dinner',
    Snacks = 'Snacks'
}

export enum FoodCategory {
  All = 'All',
  MealPrep = 'Meal Prep',
  Fruits = 'Fruits',
  Veggies = 'Veggies',
  Protein = 'Protein',
  Carbs = 'Carbs',
  Dairy = 'Dairy',
  Dishes = 'Dishes',
}

export enum ActivityType {
  Running = 'Running',
  Walking = 'Walking',
  Cycling = 'Cycling',
  WeightLifting = 'Weight Lifting',
  Yoga = 'Yoga',
  Swimming = 'Swimming',
}

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Prefer not to say',
}

export enum ActivityLevel {
    Sedentary = 'Sedentary', // Little to no exercise
    LightlyActive = 'Lightly Active', // Light exercise/sports 1-3 days/week
    ModeratelyActive = 'Moderately Active', // Moderate exercise/sports 3-5 days/week
    Active = 'Active', // Hard exercise/sports 6-7 days a week
    VeryActive = 'Very Active', // Very hard exercise & physical job
}

export enum PrimaryGoal {
    LoseWeight = 'Lose Weight',
    MaintainWeight = 'Maintain Weight',
    GainMuscle = 'Gain Muscle',
}

export enum UnitSystem {
    Imperial = 'imperial',
    Metric = 'metric',
}


export type Theme = 'light' | 'dark';
export type ThemePreference = 'light' | 'dark' | 'system';

export interface UserProfile {
    id: string;
    name: string;
    age: number;
    avatar: string;
    gender: Gender;
    height: number; // in inches
    activityLevel: ActivityLevel;
    primaryGoal: PrimaryGoal;
    unitSystem: UnitSystem;
}

export interface MacroGoals {
    protein: number;
    carbs: number;
    fats: number;
}

export interface WeightEntry {
    date: string; // YYYY-MM-DD
    weight: number; // in lbs
}

export interface Meal {
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    type: MealType;
    date: string; // YYYY-MM-DD
}

export interface CustomActivity {
    type: string;
    emoji: string;
    met: number;
}

export interface Activity {
    name: string;
    type: string;
    duration: number; // in minutes
    caloriesBurned: number;
    date: string; // YYYY-MM-DD
}

export interface FoodSearchResult {
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    imageUrl?: string;
    category?: FoodCategory;
}

export interface MealAnalysis extends Omit<Meal, 'date'> {
    fiber?: number;
    sugar?: number;
    sodium?: number;
    portionSuggestion?: string;
    type: MealType;
}

export interface PreppedMeal {
    id: string;
    name: string;
    servings: number;
    ingredients: FoodSearchResult[];
    caloriesPerServing: number;
    proteinPerServing: number;
    carbsPerServing: number;
    fatsPerServing: number;
}

export interface Reminder {
    enabled: boolean;
    time: string; // "HH:MM"
}

export type ReminderType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Water';

export type ReminderSettings = Record<ReminderType, Reminder>;

export interface UserData {
    profile: UserProfile;
    loggedMeals: Meal[];
    loggedActivities: Activity[];
    macroGoals: MacroGoals;
    weightHistory: WeightEntry[];
    goalWeight: number; // in lbs
    waterIntakeHistory: { [date: string]: number };
    waterGoal: number;
    stepsHistory: { [date: string]: number };
    stepsGoal: number;
    dayStreak: number;
    favoriteFoods: FoodSearchResult[];
    preppedMeals: PreppedMeal[];
    page: Page;
    themePreference: ThemePreference;
    customActivities: CustomActivity[];
    recentFoods: FoodSearchResult[];
    reminders: ReminderSettings;
}