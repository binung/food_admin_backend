const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    vehicleType: { type: String, required: true, enum: ['Bike', 'Car', 'Scooter', 'Drone'] },
    phone: { type: String, required: true, default: '1234567890'},
    vehicleNumber: { type: String, required: true },
    currentLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    owner: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    verification: {type: String ,default: "Pending", enum: ["Pending", "Verified", "Rejected"]},
    verificationMessage: {type: String, default: "Please allow up to 24 hours for your verification to be processed. You will receive a notification once your verification is complete."},
    rating: { type: Number, min: 1, max: 5, default: 3},
    totalDeliveries: { type: Number, default: 0 },
    profileImage: {type:String, default: "https://d326fntlu7tb1e.cloudfront.net/uploads/cf503f8d-3318-4306-9e2c-a53efb7d585b-avatar.png"},
    isActive: { type: Boolean, default: false } // To track if the driver is currently active on the platform
});

module.exports = mongoose.model('Driver', driverSchema);
