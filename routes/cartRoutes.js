const { authGuard } = require('../middleware/authGuard'); // Removed adminGuard as it is not used here
const cartController = require('../controllers/cartControllers');
const { logRequest } = require('../middleware/ActivityLog');

const router = require('express').Router();

// Add a product to the cart
router.post('/add_to_cart', authGuard,logRequest, cartController.addToCart);

// Remove a product from the cart
router.put('/remove_from_cart/:id', cartController.removeFromCart);

// Get the active cart
router.get('/get_cart', authGuard,logRequest, cartController.getActiveCart);

// Update the status of the cart
router.put('/update_status', authGuard, logRequest,cartController.updateStatus);

// Update the quantity of a product in the cart
router.put('/update_quantity', authGuard,logRequest, cartController.updateQuantity);

module.exports = router;
