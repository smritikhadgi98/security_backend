const path = require('path');
const fs = require('fs');
const productModel = require('../models/productModel');


const createProduct = async (req, res) => {
    console.log('Incoming Data:', req.body);
    console.log('Incoming Files:', req.files);

    const { productName, productPrice, productDescription, productCategory, productQuantity } = req.body;

    if (!productName || !productPrice || !productDescription || !productCategory  || !productQuantity) {
        return res.status(400).json({ success: false, message: 'Please Enter All Fields' });
    }

    if (!req.files || !req.files.productImage) {
        return res.status(400).json({ success: false, message: 'Image Not Found' });
    }

    const { productImage } = req.files;
    const imageName = `${Date.now()}-${productImage.name}`;
    const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`);

    try {
        await productImage.mv(imageUploadPath);

        const newProduct = new productModel({
            productName,
            productCategory,
          
            productPrice,
            productDescription,
            productQuantity,
            productImage: imageName,
        });

        const product = await newProduct.save();

        res.status(201).json({ success: true, message: 'Product Created Successfully', data: product });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error', error });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const allProducts = await productModel.find({});
        res.status(200).json({ success: true, message: 'Products Fetched Successfully', products: allProducts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

const getSingleProduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'No product found' });
        }

        res.status(200).json({ success: true, message: 'Product Fetched', product });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        if (product) {
            const oldImagePath = path.join(__dirname, `../public/products/${product.productImage}`);
            fs.unlinkSync(oldImagePath); // Remove old image file if it exists
        }

        await productModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

const updateProduct = async (req, res) => {
    try {
        if (req.files && req.files.productImage) {
            const { productImage } = req.files;
            const imageName = `${Date.now()}-${productImage.name}`;
            const imageUploadPath = path.join(__dirname, `../public/products/${imageName}`);

            await productImage.mv(imageUploadPath);

            req.body.productImage = imageName;

            const existingProduct = await productModel.findById(req.params.id);
            if (existingProduct) {
                const oldImagePath = path.join(__dirname, `../public/products/${existingProduct.productImage}`);
                fs.unlinkSync(oldImagePath);
            }
        }

        const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'Product Updated', product: updatedProduct });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

const paginatonProducts = async (req, res) => {
    const pageNo = parseInt(req.query.page) || 1;
    const resultPerPage = 9;

    try {
        const totalProducts = await productModel.countDocuments({});
        const products = await productModel.find({})
            .skip((pageNo - 1) * resultPerPage)
            .limit(resultPerPage);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'No products found' });
        }

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            products,
            totalProducts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

const filterProducts = async (req, res) => {
    const { category } = req.query;
    let filter = {};

    if (category) {
        filter.productCategory = category;
    }


    try {
        const filteredProducts = await productModel.find(filter);
        res.status(200).json({ success: true, message: 'Products fetched successfully', products: filteredProducts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error });
    }
};

const searchProduct = async (req, res) => {
    const searchQuery = req.query.q || '';
    const searchCategory = req.query.category || '';

    try {
        const filter = {};

        if (searchQuery) {
            filter.productName = { $regex: searchQuery, $options: 'i' };
        }

        if (searchCategory) {
            filter.productCategory = { $regex: searchCategory, $options: 'i' };
        }

        const products = await productModel.find(filter);
        res.status(200).json({ success: true, message: 'Products Fetched!', products });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error!', error });
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct,
    paginatonProducts,
    filterProducts,
    searchProduct,
   
};
