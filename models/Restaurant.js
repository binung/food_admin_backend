const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    imageUrl: { type: String, required: true },
    food: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Food' }], // Array of food IDs
    pickup: { type: Boolean, default: true },
    delivery: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    owner: { type: String, required: true },
    code: { type: String, required: true },
    logoUrl: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    ratingCount: { type: Number, default: 267 },
    verification: { type: String, default: 'Pending', enum: ['Pending', 'Rejected', 'Verified'] },
    verificationMessage: { type: String, default: 'Your restaurant is under review; you will be verified once it is verified.' },
    coords: {
        id: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        latitudeDelta: { type: Number, default: 0.0122 },
        longitudeDelta: { type: Number, default: 0.0122 },
        address: { type: String, required: true },
        title: { type: String, required: true }
    },
    earnings: { type: Number, default: 0 }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
