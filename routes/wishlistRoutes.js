const express = require('express');
const router = express.Router();
const { authGuard } = require("../middleware/authGuard");


const wishlistController = require("../controllers/wishlistControllers");
const { logRequest } = require('../middleware/ActivityLog');

// Route to add a product to the wishlist
router.post('/add', authGuard, logRequest,wishlistController.addToWishlist);

// Route to remove a product from the wishlist
router.put('/remove', authGuard, logRequest,wishlistController.removeFromWishlist);

// Route to get all products in the wishlist
router.get('/get_wishlist',authGuard, logRequest,wishlistController.getWishlist);

module.exports = router;
