const express = require('express');
const router = express.Router();
const { authGuard } = require("../middleware/authGuard");


const wishlistController = require("../controllers/wishlistControllers");

// Route to add a product to the wishlist
router.post('/add', authGuard,wishlistController.addToWishlist);

// Route to remove a product from the wishlist
router.post('/remove', authGuard, wishlistController.removeFromWishlist);

// Route to get all products in the wishlist
router.get('/get_wishlist',authGuard, wishlistController.getWishlist);

module.exports = router;
