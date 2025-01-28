// Importing packages
const express = require('express');
const mongoose = require('mongoose');
const connectDatabase = require('./database/database');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs= require('fs');
const path =require('path');
const expSanitize=require("express-mongo-sanitize");

app.use(expSanitize);

const https=require('https');

// Creating an express app
const app = express();

// dotenv Configuration
dotenv.config();

// Configure Cors policy
const corsOptions = {
    origin: 'https://localhost:3000', // Specify the exact origin
    credentials: true,
    optionsSuccessStatus: 200
};

const options={
    key:fs.readFileSync(path.resolve(__dirname,'./certificate/server.key')),
    cert:fs.readFileSync(path.resolve(__dirname,'./certificate/server.crt')),
}



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

//Making https
https.createServer(options,app).listen(PORT,()=>{
    console.log(`Server is runnning on PORT ${PORT}`)
})

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
// app.listen(PORT, () => {
//     console.log(`Server is Running on port ${PORT}!`);
// });


module.exports = app;