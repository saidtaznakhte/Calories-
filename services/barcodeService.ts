import { FoodSearchResult } from '../types';

// Mock database of barcodes to food items
const barcodeData: { [barcode: string]: FoodSearchResult } = {
  '0123456789012': {
    name: 'Peanut Butter',
    calories: 190,
    protein: 8,
    carbs: 7,
    fats: 16,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=40&h=40&fit=crop&q=80',
  },
  '9876543210987': {
    name: 'Whole Wheat Bread (2 slices)',
    calories: 160,
    protein: 8,
    carbs: 30,
    fats: 2,
    imageUrl: 'https://images.unsplash.com/photo-1534620808146-d33bb39128b2?w=40&h=40&fit=crop&q=80',
  },
  // Add more mock barcodes as needed
};

export const lookupBarcode = (barcodeValue: string): Promise<FoodSearchResult> => {
  // Use a sample barcode if the scanned one is not in our mock data, for demo purposes.
  const sampleBarcodes = Object.keys(barcodeData);
  const barcodeToLookup = barcodeData[barcodeValue] ? barcodeValue : sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const foodItem = barcodeData[barcodeToLookup];
      if (foodItem) {
        resolve(foodItem);
      } else {
        reject(new Error(`Barcode ${barcodeValue} not found.`));
      }
    }, 500); // Simulate network delay
  });
};
