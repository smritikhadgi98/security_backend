
// const axios = require('axios');
 
// let isSent = false;
// const sendOtp = async (phone, otp) => {
//     const url =
//     'https://api.managepoint.co/api/sms/send'
 
//     // payload to send
//     const payload = {
//         apiKey: '37d6f71e-884e-4636-8b4e-ee4edd0eb6ef',
//         to : phone,
//         message: `Your OTP is ${otp}`
//     }
 
//     // setting state
//    try{
//     const res = await axios.post(url, payload);
//     if(res.status===2000){
//         isSent = true;
 
//     }
 
 
//    }catch(error){
//        console.log('Error in sending otp', error.message);
//    }
 
//    return isSent;
 
 
 
// }
 
// module.exports = sendOtp;


const axios = require('axios');

const sendOtp = async (phone, otp) => {
    const url = 'https://api.managepoint.co/api/sms/send';

    // Payload to send
    const payload = {
        apiKey: process.env.SMS_API_KEY, // Use environment variable for API key
        to: phone,
        message: `Your OTP is ${otp}`
    };

    let isSent = false;

    try {
        const res = await axios.post(url, payload);
        if (res.status === 200) { // Correct status code for success
            isSent = true;
        } else {
            console.error('Failed to send OTP, status code:', res.status);
        }
    } catch (error) {
        console.error('Error in sending OTP:', error.response ? error.response.data : error.message);
    }

    return isSent;
};

module.exports = sendOtp;
