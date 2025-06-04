"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AddMealDialog } from '@/components/diet/add-meal-dialog';
import { ViewEditMealDialog } from '@/components/diet/view-edit-meal-dialog';
import { toast } from 'sonner';
import api from '@/lib/api';
import axios from 'axios';
import ButterflyLoader from '@/components/butterfly-loader';

interface FoodEntry {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  foodValue: string; 
  servingUnit: string;
  dietEntryId?: number; 
  foodId?: number; 
}

interface Meal {
  title: string; 
  time: string;
  date: Date;
  calories: number;
  foodItems?: FoodEntry[];
}

interface DayLog {
  date: Date;
  meals: Meal[];
}

interface FoodItem {
  label: string;
  value: string;
  caloriesperquantity: number;
  servingUnit: string;
  id?: number; 
}

interface BackendFoodItem {
  id: number;
  name: string;
  description: string;
  caloriesPerUnit: string;
  servingUnit: string;
  imageUrl: string;
  createdAt: string;
}

interface BackendDietEntry {
  id: number;
  userId: number;
  foodId: number;
  quantity: string;
  calories: string;
  consumptionDate: string;
  mealType: string;
  notes: string | null;
  createdAt: string;
  foodItem: BackendFoodItem;
}

// Constants
const DAILY_CALORIE_GOAL = 2500;
const MAX_MEALS_PER_DAY = 10;

const MealLogger: React.FC = () => {
  const [mealLogs, setMealLogs] = useState<DayLog[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMealDialogOpen, setAddMealDialogOpen] = useState<boolean>(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [viewMealDialogOpen, setViewMealDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const logError = (operation: string, error: any, additionalData?: any) => {
    console.group(`🔴 Error in ${operation}`);
    console.error('Error object:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error('- Status:', error.response?.status);
      console.error('- Status text:', error.response?.statusText);
      console.error('- Response data:', error.response?.data);
      console.error('- Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      });
    }
    
    if (additionalData) {
      console.error('Additional context:', additionalData);
    }
    
    console.error('Stack trace:', error.stack);
    console.groupEnd();
  };

  const logSuccess = (operation: string, data?: any) => {
    console.group(`✅ Success in ${operation}`);
    if (data) {
      console.log('Response data:', data);
    }
    console.groupEnd();
  };

  const fetchInitialData = async () => {
    try {
      console.log('🚀 Starting initial data fetch...');
      setLoading(true);
      await Promise.all([
        fetchFoodItems(),
        fetchDietEntries()
      ]);
      logSuccess('fetchInitialData');
    } catch (error) {
      logError('fetchInitialData', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      console.log('📋 Fetching food items...');
      const { data } = await api.get('/food-items/all');
      
      console.log('Raw food items response:', data);
      
      const transformedFoodItems: FoodItem[] = data.data.map((item: BackendFoodItem) => ({
        label: item.name,
        value: item.name.toLowerCase().replace(/\s+/g, '-'),
        caloriesperquantity: parseFloat(item.caloriesPerUnit),
        servingUnit: item.servingUnit,
        id: item.id
      }));
      
      console.log('Transformed food items:', transformedFoodItems);
      setFoodItems(transformedFoodItems);
      logSuccess('fetchFoodItems', { count: transformedFoodItems.length });
    } catch (error) {
      logError('fetchFoodItems', error);
      let errorMessage = 'Failed to load food items';
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const fetchDietEntries = async () => {
    try {
      console.log('🍽️ Fetching diet entries...');
      const { data } = await api.get('/diet?limit=1000');
      
      console.log('Raw diet entries response:', data);
      
      const transformedLogs = transformBackendDataToMealLogs(data.data);
      
      console.log('Transformed meal logs:', transformedLogs);
      setMealLogs(transformedLogs);
      logSuccess('fetchDietEntries', { 
        entriesCount: data.data.length, 
        daysCount: transformedLogs.length 
      });
    } catch (error) {
      logError('fetchDietEntries', error);
      let errorMessage = 'Failed to load diet entries';
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  const transformBackendDataToMealLogs = (dietEntries: BackendDietEntry[]): DayLog[] => {
    console.group('🔄 Transforming backend data to meal logs');
    console.log('Input diet entries:', dietEntries);
    
    // Group by date and meal type
    const groupedData: { [key: string]: { [mealType: string]: BackendDietEntry[] } } = {};

    dietEntries.forEach(entry => {
      const consumptionDate = new Date(entry.consumptionDate);
      const dateKey = consumptionDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const mealType = entry.mealType;

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {};
      }
      if (!groupedData[dateKey][mealType]) {
        groupedData[dateKey][mealType] = [];
      }
      groupedData[dateKey][mealType].push(entry);
    });

    console.log('Grouped data by date and meal type:', groupedData);

    // Transform to DayLog format
    const dayLogs: DayLog[] = [];

    Object.keys(groupedData).forEach(dateKey => {
      const date = new Date(dateKey);
      const meals: Meal[] = [];

      Object.keys(groupedData[dateKey]).forEach(mealType => {
        const entries = groupedData[dateKey][mealType];
        
        // Calculate meal time (use the first entry's time or default times)
        const firstEntry = entries[0];
        console.log('Raw consumptionDate from backend:', firstEntry.consumptionDate);
        const consumptionDateTime = new Date(firstEntry.consumptionDate);
        console.log('Parsed consumptionDateTime:', consumptionDateTime);
        console.log('toTimeString():', consumptionDateTime.toTimeString());
        const time = consumptionDateTime.toTimeString().slice(0, 5);
        console.log('Extracted time:', time);

        // Transform food entries
        const foodItems: FoodEntry[] = entries.map(entry => ({
          id: entry.id.toString(),
          name: entry.foodItem.name,
          quantity: parseFloat(entry.quantity),
          calories: parseFloat(entry.calories),
          foodValue: entry.foodItem.name.toLowerCase().replace(/\s+/g, '-'),
          servingUnit: entry.foodItem.servingUnit,
          dietEntryId: entry.id,
          foodId: entry.foodId
        }));

        // Calculate total calories for the meal
        const totalCalories = foodItems.reduce((sum, item) => sum + item.calories, 0);

        const meal: Meal = {
          title: capitalizeFirstLetter(mealType),
          time: time,
          date: date,
          calories: totalCalories,
          foodItems: foodItems
        };

        console.log(`Created meal for ${dateKey} ${mealType}:`, meal);
        meals.push(meal);
      });

      // Sort meals by time
      meals.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.time}`);
        const timeB = new Date(`1970-01-01T${b.time}`);
        return timeA.getTime() - timeB.getTime();
      });

      dayLogs.push({
        date: date,
        meals: meals
      });
    });

    // Sort days in descending order (newest first)
    dayLogs.sort((a, b) => b.date.getTime() - a.date.getTime());

    console.log('Final transformed day logs:', dayLogs);
    console.groupEnd();
    return dayLogs;
  };

  const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Utility functions
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&  
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const formatDateHeader = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (isSameDay(date, today)) {
      return "Today";
    } else if (isSameDay(date, yesterday)) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  const countMeals = (meals: Meal[]): number => {
    return meals.length;
  };

  const calculateTotalCalories = (meals: Meal[]): number => {
    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  };

  // Get sorted logs and ensure today is always included
  const getSortedLogsWithToday = (): DayLog[] => {
    const today = new Date();
    const sortedLogs = [...mealLogs].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const hasTodayLog = sortedLogs.some(log => isSameDay(log.date, today));
    
    if (!hasTodayLog) {
      return [{ date: today, meals: [] }, ...sortedLogs];
    }
    
    return sortedLogs;
  };

  // Get today's total calories for the goal display
  const getTodaysTotalCalories = (): number => {
    const today = new Date();
    const todayLog = mealLogs.find(log => isSameDay(log.date, today));
    return todayLog ? calculateTotalCalories(todayLog.meals) : 0;
  };

  const handleAddMeal = () => {
    setAddMealDialogOpen(true);
  };

  const handleOpenMealDetails = (meal: Meal) => {
    setSelectedMeal(meal);
    setViewMealDialogOpen(true);
  };

  // Add new meal to backend and update local state
  const handleAddNewMeal = async (meal: Meal) => {
    console.group('➕ Adding new meal');
    console.log('Meal to add:', meal);
    
    try {
      setLoading(true);
      
      // Create diet entries for each food item in the meal
      const createPromises = meal.foodItems?.map(async (foodItem, index) => {
        console.log(`Processing food item ${index + 1}:`, foodItem);
        
        const foodItemData = foodItems.find(item => item.value === foodItem.foodValue);
        console.log('Found food item data:', foodItemData);
        
        if (!foodItemData?.id) {
          const error = new Error(`Food item not found: ${foodItem.name}`);
          console.error('Food item lookup failed:', {
            searchValue: foodItem.foodValue,
            availableFoodItems: foodItems.map(item => ({ value: item.value, id: item.id }))
          });
          throw error;
        }

        const consumptionDate = new Date(meal.date);
        const [hours, minutes] = meal.time.split(':');
        consumptionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const dietEntryData = {
          foodId: foodItemData.id,
          quantity: foodItem.quantity,
          consumptionDate: consumptionDate.toISOString(),
          mealType: meal.title.toLowerCase(),
          notes: null
        };

        console.log(`Diet entry data for food item ${index + 1}:`, dietEntryData);

        const response = await api.post('/diet', dietEntryData);
        console.log(`Successfully created diet entry ${index + 1}:`, response.data);
        return response;
      }) || [];

      console.log(`Creating ${createPromises.length} diet entries...`);
      const results = await Promise.all(createPromises);
      console.log('All diet entries created successfully:', results.map(r => r.data));

      await fetchDietEntries(); 
      logSuccess('handleAddNewMeal', { mealTitle: meal.title, foodItemsCount: meal.foodItems?.length });
      toast.success('Meal added successfully');
    } catch (error) {
      logError('handleAddNewMeal', error, { meal });
      let errorMessage = 'Failed to add meal';
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // Delete a meal (delete all diet entries for that meal)
  const handleDeleteMeal = async (mealToDelete: Meal) => {
    console.group('🗑️ Deleting meal');
    console.log('Meal to delete:', mealToDelete);
    
    try {
      setLoading(true);
      
      const deletePromises = mealToDelete.foodItems?.map(async (foodItem, index) => {
        console.log(`Deleting food item ${index + 1}:`, foodItem);
        
        if (foodItem.dietEntryId) {
          console.log(`Deleting diet entry ID: ${foodItem.dietEntryId}`);
          const response = await api.delete(`/diet/${foodItem.dietEntryId}`);
          console.log(`Successfully deleted diet entry ${foodItem.dietEntryId}:`, response.data);
          return response;
        } else {
          console.warn(`Food item ${index + 1} has no dietEntryId:`, foodItem);
          return null;
        }
      }).filter(Boolean) || [];

      console.log(`Deleting ${deletePromises.length} diet entries...`);
      const results = await Promise.all(deletePromises);
      console.log('All diet entries deleted successfully:', results.map(r => r?.data));

      await fetchDietEntries(); 
      setViewMealDialogOpen(false);
      logSuccess('handleDeleteMeal', { mealTitle: mealToDelete.title });
      toast.success('Meal deleted successfully');
    } catch (error) {
      logError('handleDeleteMeal', error, { meal: mealToDelete });
      let errorMessage = 'Failed to delete meal';
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // Update a meal
  const handleUpdateMeal = async (oldMeal: Meal, updatedMeal: Meal) => {
    console.group('✏️ Updating meal');
    console.log('Old meal:', oldMeal);
    console.log('Updated meal:', updatedMeal);
    
    try {
      setLoading(true);

      console.log('Step 1: Creating new diet entries...');
      const createPromises = updatedMeal.foodItems?.map(async (foodItem, index) => {
        console.log(`Creating new food item ${index + 1}:`, foodItem);
        
        const foodItemData = foodItems.find(item => item.value === foodItem.foodValue);
        console.log('Found food item data for update:', foodItemData);
        
        if (!foodItemData?.id) {
          const error = new Error(`Food item not found: ${foodItem.name}`);
          console.error('Food item lookup failed during update:', {
            searchValue: foodItem.foodValue,
            availableFoodItems: foodItems.map(item => ({ value: item.value, id: item.id }))
          });
          throw error;
        }

        const consumptionDate = new Date(updatedMeal.date);
        const [hours, minutes] = updatedMeal.time.split(':');
        consumptionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const dietEntryData = {
          foodId: foodItemData.id,
          quantity: foodItem.quantity,
          consumptionDate: consumptionDate.toISOString(),
          mealType: updatedMeal.title.toLowerCase(),
          notes: null
        };

        console.log(`New diet entry data for food item ${index + 1}:`, dietEntryData);

        const response = await api.post('/diet', dietEntryData);
        console.log(`Successfully created new diet entry ${index + 1}:`, response.data);
        return response;
      }) || [];

      const createResults = await Promise.all(createPromises);
      console.log('All new diet entries created successfully:', createResults.map(r => r.data));

      console.log('Step 2: Deleting old diet entries...');
      const deletePromises = oldMeal.foodItems?.map(async (foodItem, index) => {
        console.log(`Deleting old food item ${index + 1}:`, foodItem);
        
        if (foodItem.dietEntryId) {
          console.log(`Deleting old diet entry ID: ${foodItem.dietEntryId}`);
          const response = await api.delete(`/diet/${foodItem.dietEntryId}`);
          console.log(`Successfully deleted old diet entry ${foodItem.dietEntryId}:`, response.data);
          return response;
        } else {
          console.warn(`Old food item ${index + 1} has no dietEntryId:`, foodItem);
          return null;
        }
      }).filter(Boolean) || [];

      const deleteResults = await Promise.all(deletePromises);
      console.log('All old diet entries deleted:', deleteResults.map(r => r?.data));

      await fetchDietEntries(); 
      setSelectedMeal(updatedMeal);
      logSuccess('handleUpdateMeal', { 
        oldMealTitle: oldMeal.title, 
        newMealTitle: updatedMeal.title 
      });
      toast.success('Meal updated successfully');
    } catch (error) {
      logError('handleUpdateMeal', error, { oldMeal, updatedMeal });
      
      console.warn('Update failed. If creation succeeded but deletion failed, you may have duplicate entries.');
      
      let errorMessage = 'Failed to update meal';
      if (axios.isAxiosError(error) && error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.groupEnd();
    }
  };

  // Component to render a meal card
  const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => {
    return (
      <Card 
        className="w-[180px] cursor-pointer hover:shadow-md transition-shadow border-border" 
        onClick={() => handleOpenMealDetails(meal)}
      >
        <CardContent>
          <div className="font-semibold text-foreground">
            {meal.title}
          </div>
          <div className="w-full mt-1.5 mb-2 border-b-[1px] border-primary/50" />
          <div className="text-sm text-muted-foreground mb-1">
            Time: {meal.time}
          </div>
          <div className="text-sm text-muted-foreground mb-1">
            Calories:
          </div>
          <div className="font-semibold text-xl text-center">
            {Math.round(meal.calories)}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Component to render a date section with meal cards
  const DateSection: React.FC<{ dayLog: DayLog }> = ({ dayLog }) => {
    const { date, meals } = dayLog;
    const totalMeals = countMeals(meals);
    const totalCalories = calculateTotalCalories(meals);
    
    const dateStr = formatDateHeader(date);
    const isToday = dateStr === "Today";
    
    let headerText = dateStr;
    if (isToday) {
      headerText += ` (${totalMeals}/${MAX_MEALS_PER_DAY})`;
    } else {
      headerText += ` (${totalMeals} meals, Total Calories: ${Math.round(totalCalories)})`;
    }

    return (
      <div className="mb-6">
        <div className="font-semibold mb-2">{headerText}</div>
        
        {meals.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-3">
            {meals.map((meal, index) => (
              <MealCard key={`${meal.title}-${meal.time}-${index}`} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No meals logged yet today
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <ButterflyLoader />
      </div>
    );
  }

  const sortedLogsWithToday = getSortedLogsWithToday();

  return (
    <div className="container mx-auto p-4">
      <div className="border border-border rounded-[var(--radius)] p-6">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Meal Log</h1>
        
        <div className="text-base text-muted-foreground mb-6">
          Daily calorie goals: {Math.round(getTodaysTotalCalories())}/{DAILY_CALORIE_GOAL}
        </div>
        
        <div>
          {sortedLogsWithToday.map((dayLog, index) => (
            <DateSection key={`${dayLog.date.toISOString()}-${index}`} dayLog={dayLog} />
          ))}
        </div>
        
        <Button 
          variant="default" 
          size="icon" 
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-md z-10"
          onClick={handleAddMeal}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Meal Dialog */}
      <AddMealDialog 
        open={addMealDialogOpen} 
        onOpenChange={setAddMealDialogOpen}
        onAddMeal={handleAddNewMeal}
        foodItems={foodItems}
      />

      {/* View/Edit Meal Dialog */}
      {selectedMeal && (
        <ViewEditMealDialog
          open={viewMealDialogOpen}
          onOpenChange={setViewMealDialogOpen}
          meal={selectedMeal}
          onDeleteMeal={handleDeleteMeal}
          onUpdateMeal={handleUpdateMeal}
          foodItems={foodItems}
        />
      )}
    </div>
  );
};

export default MealLogger;
