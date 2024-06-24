const mongoose = require('mongoose');

const CashoutSchema = new mongoose.Schema({
    restaurant: {type: mongoose.Schema.Types.ObjectId, ref: "Restaurant"},
    paymentMethod: {type: String, required: true,default: 'stripe', enum: ['stripe', 'bank', 'paypal']},
    amount: {type: String, required: true},
    status: {type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected']},
    date: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Cashout', CashoutSchema);