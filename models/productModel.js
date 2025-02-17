const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    productSkinType: {
        type: String,
        required: true
    },
    productDescription: {
        type: String,
        required: true,
        maxLength: 500
    },
    productImage: {
        type: String,
        required: true
    },
    productQuantity: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Product = mongoose.model('Product', productSchema); // Capitalize 'Product' here
module.exports = Product;
