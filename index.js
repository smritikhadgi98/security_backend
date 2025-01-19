// Importing packages
const express = require('express');
const mongoose = require('mongoose');
const connectDatabase = require('./database/database');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Creating an express app
const app = express();

// dotenv Configuration
dotenv.config();

// Configure Cors policy
const corsOptions = {
    origin: 'http://localhost:3000', // Specify the exact origin
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Express JSON and file upload configuration
app.use(express.json());
app.use(fileUpload());

// Serve static files
app.use(express.static('./public'));

// Connecting to database
connectDatabase();

// Defining the port
const PORT = process.env.PORT || 5000;

// Test endpoint
app.get('/test', (req, res) => {
    res.send('Test API is working!');
});

// Configuring routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/product', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/review', require('./routes/ratingRoutes'))
app.use('/api/order', require('./routes/orderRoutes'))
app.use("/api/khalti", require('./routes/paymentRoutes'));


// Starting the server
app.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}!`);
});


module.exports = app;