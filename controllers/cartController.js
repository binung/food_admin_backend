const Cart = require('../models/Cart');

module.exports = {
    addProductToCart: async (req, res) => {
        const { productId, instructions, additives, quantity, totalPrice } = req.body;
    
        try {
            const existingCartItem = await Cart.findOne({ productId, instructions });
    
            if (existingCartItem) {
                existingCartItem.quantity += quantity;
                existingCartItem.totalPrice += totalPrice;
                await existingCartItem.save();
                return res.status(200).json({ status: true, message: 'Product quantity updated in cart', cartItem: existingCartItem });
            }
    
            const newCartItem = new Cart({
                productId,
                instructions,
                additives,
                quantity,
                totalPrice
            });
    
            await newCartItem.save();
            res.status(200).json({ status: true, message: 'Product added to cart successfully', cartItem: newCartItem });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
    removeProductFromCart: async (req, res) => {
        try {
            // Log the product ID to the console
            console.log("Product ID:", req.params.id);
    
            // Now, proceed with the deletion operation
            await Cart.findOneAndDelete({ _id: req.params.id });
    
            // If deletion is successful, send a success response
            res.status(200).json({ status: true, message: 'Product removed from cart successfully' });
        } catch (error) {
            // If an error occurs, send an error response
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
    

    incrementProductQty: async (req, res) => {
        try {
            const cartItem = await Cart.findOneAndUpdate(
                { _id: req.params.id, userId: req.body.userId },
                { $inc: { quantity: 1, totalPrice: req.body.price } },
                { new: true }
            );

            res.status(200).json({ status: true, message: 'Product quantity incremented', cartItem });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    decrementProductQty: async (req, res) => {
        try {
            const cartItem = await Cart.findOneAndUpdate(
                { _id: req.params.id, userId: req.body.userId },
                { $inc: { quantity: -1, totalPrice: -req.body.price } },
                { new: true }
            );

            if (cartItem.quantity <= 0) {
                await Cart.findByIdAndDelete(req.params.id);
                return res.status(200).json({ status: true, message: 'Product removed from cart', cartItem: null });
            }

            res.status(200).json({ status: true, message: 'Product quantity decremented', cartItem });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getCart: async (req, res) => {
        try {
            const cartItems = await Cart.find({ userId: req.body.userId })
                .populate({
                    path: 'productId',
                    select: '_id title rating ratingCount imageUrl', // Product ke fields
                    populate: {
                        path: 'restaurant', 
                        select: '_id time coords', // Restaurant ke fields
                    }
                })
                .select('productId additives instructions totalPrice quantity');
    
            res.status(200).json({ cartItems, status: true });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },
    
    
    

    getCartCount: async (req, res) => {
        try {
            const cartCount = await Cart.countDocuments({ userId: req.body.userId });
            res.status(200).json({ status: true, cartCount });
        } catch (error) {
            res.status  .json({ status: false, message: error.message });
        }
    }
};
