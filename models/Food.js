const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    foodTags: { type: Array, required: true },
    category: { type: String, required: true },
    foodType: { type: Array, required: true },
    code: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' ,required: true },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    ratingCount: { type: String, default: '267' },
    additives: { type: Array, default: [] },
    description: { type: String, required: true },
    imageUrl: { type: Array, required: true },
    price: { type: Number, required: true },
});

module.exports = mongoose.model('Food', FoodSchema);
