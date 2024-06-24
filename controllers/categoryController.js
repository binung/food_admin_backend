const Category = require('../models/Category');

const mongoose = require('mongoose');

module.exports = {
    createCategory: async (req, res) => {
        const newCategory = new Category(req.body);
        try {
            await newCategory.save();
            res.status(201).json({ status: true, message: 'Category created successfully' });
        } catch (err) {
            res.status(500).json({ status: false, message: err.message });
        }
    },

    getAllCategory: async (req, res) => {
        try {
            const categories = await Category.find({ title: { $ne: 'More' } }, { __v: 0 });
            res.status(200).json({ status: true, message: 'Categories retrieved successfully', data: categories });
        } catch (err) {
            res.status(500).json({ status: false, message: err.message });
        }
    },

    getRandomCategory: async (req, res) => {
        try {
            let categories = await Category.aggregate([
                { $match: { value: { $ne: 'more' } } },
                { $sample: { size: 4 } }
            ]);
            const moreCategory = await Category.findOne({ value: 'more' }, { __v: 0 });
            if (moreCategory) {
                categories.push(moreCategory);
            }
            res.status(200).json({ status: true, message: 'Random categories retrieved successfully', data: categories });
        } catch (err) {
            res.status(500).json({ status: false, message: err.message });
        }
    },
    updateCategory: async (req, res) => {
        const { categoryId } = req.params; // Assuming categoryId is passed in the URL params
        const updates = req.body; // Assuming the updates are sent in the request body

        try {
            const updatedCategory = await Category.findByIdAndUpdate(categoryId, updates, { new: true });
            if (!updatedCategory) {
                return res.status(404).json({ status: false, message: 'Category not found' });
            }
            res.status(200).json({ status: true, message: 'Category  updated successfully', data: updatedCategory });
        } catch (err) {
            res.status(500).json({ status: false, message: err.message });
        }
    },
    updateCategoryImage: async (req, res) => {
        const { categoryId } = req.params;
        const { imageUrl } = req.body; 
    
        try {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ status: false, message: 'Invalid category ID' });
            }
    
            const updatedCategory = await Category.findByIdAndUpdate(
                new mongoose.Types.ObjectId(categoryId), // Use 'new' keyword here
                { imageUrl },
                { new: true }
            );
    
            if (!updatedCategory) {
                return res.status(404).json({ status: false, message: 'Category not found' });
            }
    
            res.status(200).json({ status: true, message: 'Category image updated successfully', data: updatedCategory });
        } catch (err) {
            res.status(500).json({ status: false, message: err.message });
        }
    }
};