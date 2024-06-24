const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

module.exports = {

    addFoods: async (req, res) => {
        const { title, foodTags, imageUrl, price, description, additives, time, code, category, restaurant, foodType } = req.body;
    
        if (!title || !foodTags || !imageUrl || !price || !description || !additives || !time || !category || !restaurant || !code || !foodType) {
            return res.status(400).json({ status: false, message: "You have missing fields" });
        }
    
        try {
            // Verify restaurant ID
            const existingRestaurant = await Restaurant.findById(restaurant);
            if (!existingRestaurant) {
                return res.status(404).json({ status: false, message: "Restaurant not found" });
            }
    
            const newFood = new Food({
                title,
                foodTags,
                imageUrl,
                price,
                description,
                additives,
                time,
                code,
                category,
                restaurant,
                foodType
            });
    
            const savedFood = await newFood.save();
    
            res.status(201).json({ status: true, message: 'Food has been successfully created', food: savedFood });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    foodById: async (req, res) => {
        const id = req.params.id;

        try {
            const food = await Food.findById(id);
            res.status(200).json({ food });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRandomFood: async (req, res) => {
        try {
           
         
            let food = [];

            if (req.params.code) {
                // If code is provided, match by code
                food = await Food.aggregate([
                    { $match: { code: req.params.code } },
                    { $sample: { size: 4 } },
                    { $project: { __v: 0 } },
                ]);
            } else {
                // If code is not provided, simply sample 4 random food items
                food = await Food.aggregate([
                    { $sample: { size: 4 } },
                    { $project: { __v: 0 } },
                ]);
            }
            if (food.length) {
                res.status(200).json({food,status:true});
            } else {
                res.status(404).json({ status: false, message: "No food found" });
            }
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    

    getFoodByRestaurant: async (req, res) => {
       
        const restaurantId = req.params.id;

    try {
        // Verify restaurant ID
        const existingRestaurant = await Restaurant.findById(restaurantId);
        if (!existingRestaurant) {
            return res.status(404).json({ status: false, message: "Restaurant not found" });
        }

        // Find food items that reference this restaurant
        const foodItems = await Food.find({ restaurant: restaurantId });
        res.status(200).json({ status: true, food: foodItems });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error: error.message });
    }
    }, 
    
    
   
    
    

    getFoodByCategoryAndCode: async (req, res) => {
        const { code, category } = req.params;
        try {
            const food = await Food.aggregate([
                { $match: { code: code, category: category } },
                { $project: { __v: 0 } }
            ]);
            res.status(200).json({ status: true, food });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    searchFood: async (req, res) => {
        const query = req.params.search;
        try {
            const food = await Food.aggregate([
                {
                    $search: {
                        index: "foods",
                        text: {
                            query: query,
                            path: {
                                wildcard: "*",
                            }
                        }
                    }
                }
            ]);
            res.status(200).json({ status: true, food });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRandomFoodByCategoryAndCode: async (req, res) => {
        const { category, code } = req.body;
        try {
            let food;
            food = await Food.aggregate([
                { $match: { code: code, category: category, isAvailable: true } },
                { $sample: { size: 4 } },
                { $project: { __v: 0 } },
            ]);
            if (!food || food.length === 0) {
                food = await Food.aggregate([
                    { $match: { code: code, isAvailable: true } },
                    { $sample: { size: 4 } },
                    { $project: { __v: 0 } },
                ]);
            }
            if (!food || food.length === 0) {
                food = await Food.aggregate([
                    { $match: { isAvailable: true } },
                    { $sample: { size: 4 } },
                    { $project: { __v: 0 } },
                ]);
            }
            res.status(200).json({ status: true, food });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
};
