
// const mongoose = require("mongoose");

// const paymentSchema = new mongoose.Schema(
//     {
//         transactionId: { type: String, },
//         pidx: { type: String },
//         orderId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Order",
//             required: true,
//         },
//         amount: { type: Number },
//         dataFromVerificationReq: { type: Object },
//         apiQueryFromUser: { type: Object },
//         paymentGateway: {
//             type: String,
//             enum: ["khalti", "esewa", "connectIps"],
//             required: true,
//         },
//         status: {
//             type: String,
//             enum: ["success", "pending", "failed"],
//             default: "pending",
//         },
//         paymentDate: { type: Date, default: Date.now },
//     },
//     { timestamps: true }
// );
// const Payment = mongoose.model("payment", paymentSchema);
// module.exports = Payment;



const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        transactionId: { type: String },
        pidx: { type: String },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        amount: { type: Number },
        dataFromVerificationReq: { type: Object },
        apiQueryFromUser: { type: Object },
        paymentGateway: {
            type: String,
            enum: ["khalti", "esewa", "connectIps"],
            required: true,
        },
        status: {
            type: String,
            enum: ["success", "pending", "failed"],
            default: "pending",
        },
        paymentDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);
const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;

