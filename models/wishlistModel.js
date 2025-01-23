const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishlistSchema = new mongoose.Schema({
   userId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true
       },
       productId: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'Product',
           required: true
       },
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
