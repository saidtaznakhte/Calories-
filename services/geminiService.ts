import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysis, MealType, FoodSearchResult, UserProfile, MacroGoals } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In production, the key should be set.
  console.warn("Gemini API key not found. Using a placeholder. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

const mealAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        mealName: {
            type: Type.STRING,
            description: "A short, descriptive name for the meal, like 'Avocado Toast with Egg' or 'Chicken Salad'.",
        },
        calories: {
            type: Type.NUMBER,
            description: "Estimated total calories for the meal.",
        },
        protein: {
            type: Type.NUMBER,
            description: "Estimated grams of protein.",
        },
        carbs: {
            type: Type.NUMBER,
            description: "Estimated grams of carbohydrates.",
        },
        fats: {
            type: Type.NUMBER,
            description: "Estimated grams of fat.",
        },
        fiber: { 
            type: Type.NUMBER, 
            description: "Estimated grams of fiber." 
        },
        sugar: { 
            type: Type.NUMBER, 
            description: "Estimated grams of sugar." 
        },
        sodium: { 
            type: Type.NUMBER, 
            description: "Estimated milligrams of sodium." 
        },
        portionSuggestion: { 
            type: Type.STRING, 
            description: "A brief, helpful suggestion about the portion size, e.g., 'Looks like a well-balanced portion!' or 'Consider a smaller serving of fries to reduce fat intake.'" 
        }
    },
    required: ["mealName", "calories", "protein", "carbs", "fats", "fiber", "sugar", "sodium", "portionSuggestion"],
};

const foodSearchSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: {
                type: Type.STRING,
                description: "The name of the food item, e.g., 'Apple' or 'Grilled Chicken Breast (100g)'. Include serving size if relevant."
            },
            description: {
                type: Type.STRING,
                description: "A brief, one-sentence description of the food item, e.g., 'A crisp, sweet fruit' or 'Lean source of protein'."
            },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER, description: "in grams" },
            carbs: { type: Type.NUMBER, description: "in grams" },
            fats: { type: Type.NUMBER, description: "in grams" },
            imageUrl: {
                type: Type.STRING,
                description: "A URL to a high-quality, public image of the food item."
            },
        },
        required: ["name", "description", "calories", "protein", "carbs", "fats", "imageUrl"]
    }
};

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of 2 to 3 short, actionable, and encouraging suggestions for the user.",
            items: {
                type: Type.STRING,
            }
        }
    },
    required: ["suggestions"],
};

interface SuggestionPayload {
    profile: UserProfile;
    macroGoals: MacroGoals;
    calorieGoal: number;
    avgNutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
    };
    avgCaloriesBurned: number;
}

export const analyzeMealPhoto = async (base64Image: string): Promise<MealAnalysis> => {
    if (!API_KEY) {
        // Return mock data if API key is not available
        return new Promise(resolve => setTimeout(() => resolve({
            name: "Avocado Salad (Mock)",
            calories: 350,
            protein: 15,
            carbs: 25,
            fats: 20,
            fiber: 8,
            sugar: 5,
            sodium: 300,
            portionSuggestion: "This looks like a healthy and well-balanced portion. Great choice!",
            type: MealType.Lunch
        }), 1500));
    }

    try {
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
            },
        };

        const textPart = {
            text: "Analyze the food in this image. Provide a detailed nutritional estimate including calories, protein, carbohydrates, fats, fiber, sugar, and sodium. Identify the meal, give it a short name, and provide a constructive suggestion on the portion size.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: mealAnalysisSchema,
            }
        });

        const jsonResponseText = response.text.trim();
        const parsedData = JSON.parse(jsonResponseText);
        
        // Assume a meal type for simplicity. A real app might ask the user.
        const currentHour = new Date().getHours();
        let mealType = MealType.Snacks;
        if (currentHour >= 5 && currentHour < 11) mealType = MealType.Breakfast;
        else if (currentHour >= 11 && currentHour < 16) mealType = MealType.Lunch;
        else if (currentHour >= 16 && currentHour < 22) mealType = MealType.Dinner;

        return {
            name: parsedData.mealName,
            calories: parsedData.calories,
            protein: parsedData.protein,
            carbs: parsedData.carbs,
            fats: parsedData.fats,
            fiber: parsedData.fiber,
            sugar: parsedData.sugar,
            sodium: parsedData.sodium,
            portionSuggestion: parsedData.portionSuggestion,
            type: mealType,
        };

    } catch (error) {
        console.error("Error analyzing meal with Gemini:", error);
        throw new Error("Failed to get nutritional information from the image.");
    }
};

const searchCache = new Map<string, FoodSearchResult[]>();

export const searchFood = async (query: string): Promise<FoodSearchResult[]> => {
    const cacheKey = query.trim().toLowerCase();
    if (searchCache.has(cacheKey)) {
        return searchCache.get(cacheKey)!;
    }

    if (!API_KEY) {
        // Mock data for development
        const mockResults = await new Promise<FoodSearchResult[]>(resolve => setTimeout(() => {
            if (query.toLowerCase().includes('chicken')) {
                resolve([
                    { name: "Grilled Chicken Breast (100g)", description: "Lean, high-protein poultry.", calories: 165, protein: 31, carbs: 0, fats: 3.6, imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c7373058?w=40&h=40&fit=crop&q=80' },
                    { name: "Fried Chicken Thigh", description: "Crispy and savory fried chicken.", calories: 280, protein: 25, carbs: 10, fats: 15, imageUrl: 'https://images.unsplash.com/photo-1626645737590-7214c71b4235?w=40&h=40&fit=crop&q=80' },
                    { name: "Chicken Noodle Soup (1 cup)", description: "Comforting classic soup.", calories: 75, protein: 5, carbs: 9, fats: 2, imageUrl: 'https://images.unsplash.com/photo-1611270418597-a6c77d2b2a4a?w=40&h=40&fit=crop&q=80' },
                ]);
            } else if (query.toLowerCase().includes('apple')) {
                 resolve([
                    { name: "Apple (medium)", description: "A crisp and sweet fruit.", calories: 95, protein: 0.5, carbs: 25, fats: 0.3, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b69665?w=40&h=40&fit=crop&q=80' },
                    { name: "Apple Juice (1 cup)", description: "Sweet, filtered juice from apples.", calories: 114, protein: 0.2, carbs: 28, fats: 0.3, imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c59851?w=40&h=40&fit=crop&q=80' },
                ]);
            } else {
                resolve([]);
            }
        }, 800));
        searchCache.set(cacheKey, mockResults);
        return mockResults;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: `Find nutritional information for "${query}". The user's query might be in English or another language like Arabic. Provide a list of matching food items. The name of the food should be in the same language as the query. Include their calories, protein, carbs, and fats for a standard serving size. Also, provide a URL for a representative image for each item.` }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: foodSearchSchema,
            }
        });

        const jsonResponseText = response.text.trim();
        const parsedData = JSON.parse(jsonResponseText) as FoodSearchResult[];
        searchCache.set(cacheKey, parsedData);
        return parsedData;

    } catch (error) {
        console.error("Error searching for food with Gemini:", error);
        throw new Error("Failed to search for food items.");
    }
};

export const getAIPersonalizedSuggestion = async (payload: SuggestionPayload): Promise<string[]> => {
    if (!API_KEY) {
        // Mock data
        return new Promise(resolve => setTimeout(() => resolve([
            "You're doing great with your calorie goal! Maybe add a bit more protein like Greek yogurt to feel fuller.",
            "Awesome activity level! Consider a 15-minute walk after dinner to aid digestion and add more steps.",
            "Remember to stay hydrated! Drinking enough water can boost your metabolism."
        ]), 1500));
    }
    
    const { profile, macroGoals, calorieGoal, avgNutrition, avgCaloriesBurned } = payload;
    
    const prompt = `
        Act as a friendly, encouraging, and insightful AI fitness and nutrition coach.
        Analyze the following user data and provide 2-3 short, simple, and actionable suggestions to help them reach their goals. 
        Keep each suggestion to one sentence. The tone should be positive and motivational.

        User Profile:
        - Goal: ${profile.primaryGoal}
        - Age: ${profile.age}
        - Gender: ${profile.gender}
        - Activity Level: ${profile.activityLevel}

        User's Goals:
        - Daily Calorie Goal: ${calorieGoal.toFixed(0)} kcal
        - Protein Goal: ${macroGoals.protein}g
        - Carbohydrates Goal: ${macroGoals.carbs}g
        - Fats Goal: ${macroGoals.fats}g

        User's Average Performance (last 7 days):
        - Average Daily Calorie Intake: ${avgNutrition.calories.toFixed(0)} kcal
        - Average Daily Protein Intake: ${avgNutrition.protein.toFixed(0)}g
        - Average Daily Carbohydrates Intake: ${avgNutrition.carbs.toFixed(0)}g
        - Average Daily Fats Intake: ${avgNutrition.fats.toFixed(0)}g
        - Average Daily Calories Burned from Activity: ${avgCaloriesBurned.toFixed(0)} kcal

        Based on this data, identify areas for improvement or encouragement. For example, if protein is low, suggest a high-protein snack. If calories are too high for a weight loss goal, suggest a small change like swapping a sugary drink for water. If activity is good, praise them and suggest a small addition.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            }
        });

        const jsonResponseText = response.text.trim();
        const parsedData = JSON.parse(jsonResponseText);

        if (parsedData && parsedData.suggestions) {
            return parsedData.suggestions;
        }
        return [];

    } catch (error) {
        console.error("Error getting AI suggestion:", error);
        throw new Error("Failed to generate personalized suggestions.");
    }
};