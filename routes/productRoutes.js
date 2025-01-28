const router = require('express').Router();
const productController = require('../controllers/productControllers');
const { logRequest } = require('../middleware/ActivityLog');
const { authGuard, adminGuard } = require('../middleware/authGuard');

// Public routes
router.post('/create', adminGuard, productController.createProduct);
router.delete('/delete_product/:id', adminGuard, productController.deleteProduct);
router.put('/update_product/:id', adminGuard, productController.updateProduct);

 // Only admin should be able to create products

// Protected routes
router.get('/get_all_products', authGuard, logRequest,productController.getAllProducts);
router.get('/get_single_product/:id', authGuard, logRequest,productController.getSingleProduct);
router.get('/search', productController.searchProduct);

// Public routes
router.get('/pagination', productController.paginatonProducts);
router.get('/filter', productController.filterProducts);



module.exports = router;
