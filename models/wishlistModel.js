const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
