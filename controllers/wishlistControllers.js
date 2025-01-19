const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');

const addToWishlist = async (req, res) => {
    const { userId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid User or Product ID' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [] });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
            return res.status(200).json({ success: true, message: 'Product added to wishlist' });
        }

        return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const removeFromWishlist = async (req, res) => {
    const { userId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ success: false, message: 'Invalid User or Product ID' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        const index = wishlist.products.indexOf(productId);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
        }

        wishlist.products.splice(index, 1);
        await wishlist.save();

        return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getWishlist = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid User ID' });
    }

    try {
        const wishlist = await Wishlist.findOne({ user: userId }).populate('products');
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        return res.status(200).json({ success: true, wishlist: wishlist.products });
    } catch (error) {
        console.error('Error getting wishlist:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
