const Rating = require('../models/Rating');

// Get Ratings
module.exports = {

  getRating : async (req, res) => {
    try {
        const { product, ratingType } = req.query;
        if (!product || !ratingType) {
            return res.status(400).json({ message: "Product and rating type are required" });
        }

        const ratings = await Rating.find({ product, ratingType });
        const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length || 0;

        res.status(200).json({ 
            product,
            ratingType,
            averageRating,
            ratings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},

// Add Rating
addRating : async (req, res) => {
    try {
        const { userId, ratingType, productId, rating } = req.body;
    
        if (!userId || !ratingType || !productId || !rating) {
          return res.status(400).json({ message: "All fields are required" });
        }
    
        const newRating = new Rating({
          userId,
          ratingType,
          productId,
          rating
        });
    
        await newRating.save();
    
        res.status(201).json({ message: "Rating submitted successfully", rating: newRating });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}
}