const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');
const path = require("path");

const addToWishlist = async (req, res) => {
    console.log(req.body);
    const { productId, quantity } = req.body;
    const id = req.user.id;
    console.log(id);

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!",
            });
        }
        const existingProduct = await Wishlist.findOne({
            productId: productId,
            userId: id,
           
        });
        if (existingProduct) {
            return res.json({
                success: false,
                message: "Product already in wishlist!",
            });
        }
        const wishlist = new Wishlist({
            productId: productId,
            userId: id,
        
        });

        await wishlist.save();

        res.status(201).json({
            success: true,
            message: "Product added to wishlist successfully!",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error!",
        });
    }
};

const removeFromWishlist = async (req, res) => {
    const { id } = req.body;
    const userId = req.user.id;
  
    try {
      const existingWishlistItem = await Wishlist.findOne({ 
        _id: id, 
        userId: userId 
      });
  
      if (!existingWishlistItem) {
        return res.status(404).json({
          success: false,
          message: "Product not found in your wishlist!"
        });
      }
  
      await Wishlist.findByIdAndDelete(id);
  
      res.status(200).json({
        success: true,
        message: "Product removed from wishlist successfully!"
      });
  
    } catch (error) {
      console.error('Remove from Wishlist Error:', error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error!"
      });
    }
  };
const getWishlist = async (req, res) => {
    const id = req.user.id;
    console.log('User ID:', id); // Log user ID
  
    try {
      const wishlistItems = await Wishlist
        .find({ userId: id })
        .populate({
          path: 'productId',
          select: 'productName productPrice productImage' // Specify fields to populate
        });
  
      console.log('Wishlist Items:', wishlistItems);
      console.log('Wishlist Items Count:', wishlistItems.length);
  
      res.status(200).json({
        success: true,
        products: wishlistItems,
        message: "Wishlist items fetched successfully!"
      });
    } catch (error) {
      console.error('Wishlist Fetch Error:', error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error!"
      });
    }
  };
module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};




