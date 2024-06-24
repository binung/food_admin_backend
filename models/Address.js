const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    addressLine1: { type: String, required: true },
    postalCode: { type: String, required: true },
    deliveryInstructions: { type: String, required: true },
    default: { type: Boolean, required: true },
    longitude: { type: Number, required: true },
    latitude: { type: Number, required: true }
});

module.exports = mongoose.model('Address', AddressSchema);
