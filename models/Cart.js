const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    
    instructions: { type: String, required: true },
    additives: { type: Array, required: false, default: [] },
    totalPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
