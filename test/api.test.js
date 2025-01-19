const request = require("supertest");
const app = require("../index");
const mongoose = require('mongoose');

describe("User API Tests", () => {
    let authToken = "";
    let adminToken = "";
    let productId = "";
    let wishlistId = "";

    beforeAll(async () => {
        // Cleanup: remove test users and products if they already exist
        await mongoose.connection.collection('User').deleteMany({ email: { $in: ['test@gmail.com', 'admin@gmail.com'] } });
        await mongoose.connection.collection('Product').deleteMany({ productName: 'test' });
        await mongoose.connection.collection('Wishlist').deleteMany({});
    });

    afterAll(async () => {
        // Cleanup: remove created test users and products
        await mongoose.connection.collection('User').deleteMany({ email: { $in: ['test@gmail.com', 'admin@gmail.com'] } });
        await mongoose.connection.collection('Product').deleteMany({ productName: 'test' });
        await mongoose.connection.collection('Wishlist').deleteMany({});
        await mongoose.connection.close();
    });

    it("Post /register | Register new user", async () => {
        const response = await request(app).post("/api/user/create").send({
            userName: "test",
            email: "test@gmail.com",
            password: "12345678",
            phone: "1234567899",
        });
        console.log('Register User Response:', response.body);
        if (response.statusCode === 201) {
            expect(response.body.message).toEqual("User Created successfully");
        } else {
            expect(response.body.message).toEqual("User Already Exists!");
        }
    });

    it("Post /register | Register new owner", async () => {
        const response = await request(app).post("/api/user/create").send({
            userName: "test111",
            email: "admin@gmail.com",
            password: "12345678",
            phone: "124356789",
            isAdmin: true,
        });
        console.log('Register Admin Response:', response.body);
        if (response.body.success === true) {
            expect(response.body.message).toEqual("User Created Successfully");
        } else {
            expect(response.body.message).toEqual("User Already Exists!");
        }
    });
    it("Post /login | Login user", async () => {
        const response = await request(app).post("/api/user/login").send({
            email: "test@gmail.com",
            password: "12345678",
        });
        console.log('User Login Response:', response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
        authToken = response.body.token;
    });

    it("Post /login | Login admin", async () => {
        const response = await request(app).post("/api/user/login").send({
            email: "admin@gmail.com",
            password: "12345678",
        });
        console.log('Admin Login Response:', response.body);
        if (response.statusCode === 200) {
            expect(response.body).toHaveProperty("token");
            adminToken = response.body.token;
            console.log('Admin Token:', adminToken);
        } else {
            console.error('Admin login failed:', response.body);
        }
    });
    it("POST /api/product/create | Add new product", async () => {
        const response = await request(app)
            .post('/api/product/create')
            .send({
                productName: 'test',
                productDescription: 'test',
                productQuantity: 2,
                productPrice: 10,
                productCategory: 'test',
                productSkinType: 'test',
            })
            .set('Authorization', `Bearer ${adminToken}`);
        console.log('Add Product Response:', response.body);
        if (response.statusCode === 201) {
            expect(response.body).toHaveProperty('message');
            expect(response.body.data).toHaveProperty('_id');
            productId = response.body.data._id;
        } else {
            console.error('Failed to add product:', response.body);
        }
    });

    it("GET /api/product/get_single_product/:id | Get product by id", async () => {
        const response = await request(app)
            .get(`/api/product/get_single_product/${productId}`)
            .set('Authorization', `Bearer ${authToken}`);
        console.log('Get Product by ID Response:', response.body);
        if (response.statusCode === 200) {
            expect(response.body).toHaveProperty('product');
            expect(response.body.product.productName).toBe('test');
        } else {
            console.error('Failed to get product:', response.body);
        }
    });

    it("DELETE /api/product/delete_product/:id | Delete product", async () => {
        const response = await request(app)
            .delete(`/api/product/delete_product/${productId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        console.log('Delete Product Response:', response.body);
        if (response.statusCode === 200) {
            expect(response.body).toHaveProperty('message', 'Product deleted successfully');
        } else {
            console.error('Failed to delete product:', response.body);
        }
    });

    // Wishlist Tests

    it("POST /api/wishlist/add | Add product to wishlist", async () => {
        const response = await request(app)
            .post('/api/wishlist/add')
            .send({
                userId: userId,
                productId: productId
            })
            .set('Authorization', `Bearer ${authToken}`);
        console.log('Add to Wishlist Response:', response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toEqual('Product added to wishlist');
    });

    it("GET /api/wishlist/:userId | Get wishlist", async () => {
        const response = await request(app)
            .get(`/api/wishlist/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);
        console.log('Get Wishlist Response:', response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('wishlist');
        expect(response.body.wishlist).toEqual(expect.arrayContaining([expect.objectContaining({ _id: productId })]));
    });

    it("DELETE /api/wishlist/remove | Remove product from wishlist", async () => {
        const response = await request(app)
            .delete('/api/wishlist/remove')
            .send({
                userId: userId,
                productId: productId
            })
            .set('Authorization', `Bearer ${authToken}`);
        console.log('Remove from Wishlist Response:', response.body);
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toEqual('Product removed from wishlist');
    });
});