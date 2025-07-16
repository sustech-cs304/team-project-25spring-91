// dietSeed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDietFeature() {
  console.log('Starting Diet Feature Seeding...');

  try {
    // ================================================================
    // FETCH EXISTING USERS TO LINK DIET ENTRIES TO
    // ================================================================
    
    // Get existing users to create diet entries for
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('No users found in database. Cannot create diet entries.');
      return;
    }

    console.log(`Found ${users.length} users for diet tracking setup.`);

    // ================================================================
    // CREATE FOOD ITEMS DATABASE
    // ================================================================
    
    console.log('Creating food items database...');
    
    const foodItemsData = [
      // Proteins
      {
        name: "Chicken Breast",
        description: "Skinless, boneless chicken breast",
        caloriesPerUnit: 165,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/chicken-breast.jpg"
      },
      {
        name: "Salmon Fillet",
        description: "Wild-caught salmon fillet",
        caloriesPerUnit: 208,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/salmon.jpg"
      },
      {
        name: "Ground Beef (90% lean)",
        description: "Lean ground beef",
        caloriesPerUnit: 176,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/ground-beef.jpg"
      },
      {
        name: "Eggs",
        description: "Whole chicken eggs",
        caloriesPerUnit: 72,
        servingUnit: "large egg",
        imageUrl: "https://example.com/images/food/eggs.jpg"
      },
      {
        name: "Greek Yogurt",
        description: "Plain, non-fat Greek yogurt",
        caloriesPerUnit: 59,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/greek-yogurt.jpg"
      },
      {
        name: "Tofu",
        description: "Firm tofu",
        caloriesPerUnit: 76,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/tofu.jpg"
      },
      {
        name: "Tuna (canned in water)",
        description: "Canned tuna in water, drained",
        caloriesPerUnit: 116,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/tuna.jpg"
      },
      {
        name: "Turkey Breast",
        description: "Roasted turkey breast, no skin",
        caloriesPerUnit: 135,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/turkey.jpg"
      },
      
      // Carbohydrates
      {
        name: "Brown Rice",
        description: "Cooked brown rice",
        caloriesPerUnit: 112,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/brown-rice.jpg"
      },
      {
        name: "Sweet Potato",
        description: "Baked sweet potato",
        caloriesPerUnit: 86,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/sweet-potato.jpg"
      },
      {
        name: "Oatmeal",
        description: "Plain cooked oatmeal",
        caloriesPerUnit: 68,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/oatmeal.jpg"
      },
      {
        name: "Whole Wheat Bread",
        description: "Whole wheat bread slice",
        caloriesPerUnit: 69,
        servingUnit: "slice",
        imageUrl: "https://example.com/images/food/whole-wheat-bread.jpg"
      },
      {
        name: "Quinoa",
        description: "Cooked quinoa",
        caloriesPerUnit: 120,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/quinoa.jpg"
      },
      {
        name: "Banana",
        description: "Medium-sized banana",
        caloriesPerUnit: 105,
        servingUnit: "medium",
        imageUrl: "https://example.com/images/food/banana.jpg"
      },
      {
        name: "Apple",
        description: "Medium-sized apple",
        caloriesPerUnit: 95,
        servingUnit: "medium",
        imageUrl: "https://example.com/images/food/apple.jpg"
      },
      {
        name: "Pasta (whole wheat)",
        description: "Whole wheat pasta, cooked",
        caloriesPerUnit: 124,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/pasta.jpg"
      },
      
      // Fats
      {
        name: "Avocado",
        description: "Fresh avocado",
        caloriesPerUnit: 160,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/avocado.jpg"
      },
      {
        name: "Olive Oil",
        description: "Extra virgin olive oil",
        caloriesPerUnit: 119,
        servingUnit: "tbsp",
        imageUrl: "https://example.com/images/food/olive-oil.jpg"
      },
      {
        name: "Almonds",
        description: "Raw almonds",
        caloriesPerUnit: 164,
        servingUnit: "1/4 cup",
        imageUrl: "https://example.com/images/food/almonds.jpg"
      },
      {
        name: "Peanut Butter",
        description: "Natural peanut butter",
        caloriesPerUnit: 94,
        servingUnit: "tbsp",
        imageUrl: "https://example.com/images/food/peanut-butter.jpg"
      },
      
      // Vegetables
      {
        name: "Broccoli",
        description: "Fresh broccoli, steamed",
        caloriesPerUnit: 34,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/broccoli.jpg"
      },
      {
        name: "Spinach",
        description: "Fresh spinach, raw",
        caloriesPerUnit: 23,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/spinach.jpg"
      },
      {
        name: "Bell Pepper",
        description: "Fresh bell pepper",
        caloriesPerUnit: 31,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/bell-pepper.jpg"
      },
      {
        name: "Carrots",
        description: "Fresh carrots",
        caloriesPerUnit: 41,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/carrots.jpg"
      },
      
      // Dairy
      {
        name: "Milk (2% fat)",
        description: "2% fat milk",
        caloriesPerUnit: 122,
        servingUnit: "cup",
        imageUrl: "https://example.com/images/food/milk.jpg"
      },
      {
        name: "Cheddar Cheese",
        description: "Sharp cheddar cheese",
        caloriesPerUnit: 113,
        servingUnit: "30g",
        imageUrl: "https://example.com/images/food/cheddar.jpg"
      },
      {
        name: "Cottage Cheese",
        description: "Low-fat cottage cheese",
        caloriesPerUnit: 98,
        servingUnit: "100g",
        imageUrl: "https://example.com/images/food/cottage-cheese.jpg"
      },
      
      // Prepared Meals
      {
        name: "Grilled Chicken Salad",
        description: "Grilled chicken with mixed greens and vegetables",
        caloriesPerUnit: 350,
        servingUnit: "meal",
        imageUrl: "https://example.com/images/food/chicken-salad.jpg"
      },
      {
        name: "Protein Smoothie",
        description: "Protein powder with banana, milk, and berries",
        caloriesPerUnit: 280,
        servingUnit: "smoothie",
        imageUrl: "https://example.com/images/food/protein-smoothie.jpg"
      },
      {
        name: "Turkey Sandwich",
        description: "Turkey, lettuce, tomato on whole wheat bread",
        caloriesPerUnit: 320,
        servingUnit: "sandwich",
        imageUrl: "https://example.com/images/food/turkey-sandwich.jpg"
      },
      {
        name: "Oatmeal with Fruit",
        description: "Oatmeal with berries and honey",
        caloriesPerUnit: 240,
        servingUnit: "bowl",
        imageUrl: "https://example.com/images/food/oatmeal-fruit.jpg"
      }
    ];
    
    const foodItems = [];
    
    for (const foodData of foodItemsData) {
      const foodItem = await prisma.foodItem.upsert({
        where: { name: foodData.name },
        update: foodData,  // If already exists, update data
        create: foodData
      });
      
      foodItems.push(foodItem);
      console.log(`Created/updated food item: ${foodItem.name}`);
    }
    
    console.log(`Created ${foodItems.length} food items for diet tracking.`);
    
    // ================================================================
    // CREATE DIET ENTRIES FOR USERS
    // ================================================================
    
    console.log('Creating diet entries for users...');
    
    // Define meal types
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    // Track total entries created
    let totalEntries = 0;
    
    // Create entries for each user
    for (const user of users) {
      // Create entries for the last 14 days
      for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
        const consumptionDate = new Date();
        consumptionDate.setDate(consumptionDate.getDate() - dayOffset);
        consumptionDate.setHours(0, 0, 0, 0);  // Reset time to beginning of day
        
        // Determine how many meals this user had on this day (3-5)
        const dailyMeals = 3 + Math.floor(Math.random() * 3);
        
        // Keep track of which meal types have been used today
        const usedMealTypes = [];
        
        // Ensure breakfast, lunch, and dinner are included if daily meals >= 3
        if (dailyMeals >= 3) {
          usedMealTypes.push('breakfast', 'lunch', 'dinner');
        } else {
          // Random selection of meal types if fewer than 3 meals
          while (usedMealTypes.length < dailyMeals) {
            const mealType = mealTypes[Math.floor(Math.random() * 3)]; // Exclude snacks for now
            if (!usedMealTypes.includes(mealType)) {
              usedMealTypes.push(mealType);
            }
          }
        }
        
        // Add snacks if we need more meals
        while (usedMealTypes.length < dailyMeals) {
          usedMealTypes.push('snack');
        }
        
        // Create entries for each meal
        for (const mealType of usedMealTypes) {
          // Skip some meals randomly to create more realistic data (20% chance to skip)
          if (Math.random() < 0.2 && mealType !== 'lunch' && mealType !== 'dinner') {
            continue;
          }
          
          // Select 1-3 food items for this meal
          const foodCount = mealType === 'snack' ? 1 : 1 + Math.floor(Math.random() * 3);
          const mealFoods = [];
          
          while (mealFoods.length < foodCount) {
            const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)];
            if (!mealFoods.includes(randomFood)) {
              mealFoods.push(randomFood);
            }
          }
          
          // Create entries for each food in the meal
          for (const food of mealFoods) {
            // Determine quantity (between 0.5 and 3)
            const quantity = 0.5 + Math.round(Math.random() * 5) / 2;
            
            // Calculate calories
            const calories = parseFloat(food.caloriesPerUnit) * quantity;
            
            // Create the diet entry
            try {
              const dietEntry = await prisma.dietEntry.create({
                data: {
                  userId: user.id,
                  foodId: food.id,
                  quantity: quantity,
                  calories: calories,
                  consumptionDate: new Date(consumptionDate),
                  mealType: mealType,
                  notes: Math.random() < 0.3 ? 
                    ['Delicious!', 'Really enjoyed this', 'Good source of protein', 'Healthy choice', 'Quick meal'][Math.floor(Math.random() * 5)] : 
                    null
                }
              });
              
              totalEntries++;
              
              // Log less frequently to reduce console output
              if (totalEntries % 10 === 0) {
                console.log(`Created ${totalEntries} diet entries so far...`);
              }
            } catch (error) {
              console.log(`Error creating diet entry: ${error.message}`);
            }
          }
        }
      }
      
      console.log(`Completed diet entries for user: ${user.email}`);
    }
    
    console.log(`Created ${totalEntries} total diet entries for ${users.length} users.`);
    
    // ================================================================
    // SUMMARY
    // ================================================================
    
    console.log('\nDiet Feature Seeding Completed!');
    console.log(`Created ${foodItems.length} food items in the database`);
    console.log(`Created ${totalEntries} diet entries across ${users.length} users`);
    console.log('Each user has approximately 14 days of diet tracking data');
    
  } catch (error) {
    console.error('Error during diet feature seeding:', error);
  }
}

seedDietFeature()
  .catch(e => {
    console.error('Error in diet seeding script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });