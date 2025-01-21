const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendOtp = require('../service/sentOtp');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const {sendLoginOTP}= require('../service/authentication')




// Function to create a new user
const { body, validationResult } = require('express-validator');
// Password validation regex: 
// Minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 special character
const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createUser = [
  body('userName').notEmpty().withMessage('User name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password')
    .matches(passwordValidationRegex).withMessage('Password must be at least 8 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { userName, email, password, phone } = req.body;

    try {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User Already Exists!' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new userModel({
        userName,
        email,
        password: hashedPassword,
        phone,
        isAdmin: false
      });

      await newUser.save();

      res.status(200).json({ success: true, message: 'User Created Successfully' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
];

const loginUser = async (req, res) => {
  const { email, password, otp } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter all the fields' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User Does Not Exist!' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Password Does Not Match!' });
    }

    // Debugging Logs
    console.log("Stored OTP:", user.loginOTP);
    console.log("Stored OTP Expiry:", user.loginOTPExpires);
    console.log("Received OTP:", otp);
    console.log("Current Time:", new Date());

    // If OTP is required but not provided, generate a new OTP
    if (!otp) {
      if (user.loginOTP && user.loginOTPExpires > new Date()) {
        return res.status(200).json({
          success: true,
          message: "OTP already sent. Please check your email.",
          requireOTP: true,
        });
      }

      const loginOTP = (Math.floor(100000 + Math.random() * 900000)).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

      user.loginOTP = loginOTP;
      user.loginOTPExpires = otpExpiry;
      await user.save();

      const emailSent = await sendLoginOTP(email, loginOTP);
      if (!emailSent) {
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
      }

      return res.status(200).json({ success: true, message: "OTP sent to your email", requireOTP: true });
    }

    // Fetch fresh user data before OTP verification
    const freshUser = await userModel.findOne({ email });
    if (!freshUser) {
      return res.status(404).json({ success: false, message: 'User Not Found!' });
    }

    // Verify OTP
    if (freshUser.loginOTP !== otp || freshUser.loginOTPExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Clear OTP after successful verification
    freshUser.loginOTP = null;
    freshUser.loginOTPExpires = null;
    await freshUser.save();

    const token = jwt.sign({ id: freshUser._id, isAdmin: freshUser.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      success: true,
      message: 'User Logged In Successfully!',
      token,
      userData: {
        id: freshUser._id,
        userName: freshUser.userName,
        email: freshUser.email,
        phone: freshUser.phone,
        isAdmin: freshUser.isAdmin
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const loginOtp = async (req, res) => {
  const { email, otp } = req.body;
 
  try {
    const user = await userModel.findOne({
      email,
      loginOTP: otp,
      loginOTPExpires: { $gt: Date.now() },
    });
 
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }
 
    // Reset login attempts and clear OTP
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.loginOTP = null;
    user.loginOTPExpires = null;
    await user.save();
 
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET
    );
 
    res.status(200).json({
      success: true,
      message: "User Logged in Successfully!",
      token: token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
 
const verifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;
 
  try {
    const user = await userModel.findOne({
      email,
      verificationOTP: otp,
      otpExpires: { $gt: Date.now() },
    });
 
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }
 
    // Update user verification status
    user.isVerified = true;
    user.verificationOTP = null;
    user.otpExpires = null;
    await user.save();
 
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
 
const resendLoginOtp = async (req, res) => {
  const { email } = req.body;
 
  try {
    const user = await userModel.findOne({ email });
 
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
 
    const loginOTP = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
 
    user.loginOTP = loginOTP;
    user.loginOTPExpires = otpExpiry;
    await user.save();
 
    const emailSent = await sendLoginOTP(email, loginOTP);
 
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }
 
    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// Function to handle user login

// Function to generate a new token
const getToken = async (req, res) => {
  console.log(req.body);

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required',
    });
  }

  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,

    );

    res.status(200).json({
      success: true,
      message: 'Token generated successfully!',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// Function to get the current user details
const getCurrentUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required'
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select('-password'); // Do not return the password

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User found!',
      user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

const forgotPassword = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Please enter your phone number",
    });
  }

  try {
    // Finding user by phone number
    const user = await userModel.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP random 6 digit number
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = Date.now() + 10 * 60 * 1000; // OTP expiry time

    // Save to database for verification
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = expiry;
    await user.save();

    // Send OTP to registered phone number
    const isSent = await sendOtp(phone, otp); // Ensure this function works and returns appropriate result
    if (!isSent) {
      return res.status(500).json({
        success: false,
        message: 'Error sending OTP'
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error); // Log error for debugging
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const verifyOtpAndResetPassword = async (req, res) => {
  const { phone, otp, password } = req.body;

  if (!phone || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Please enter all fields",
    });
  }

  try {
    const user = await userModel.findOne({ phone: phone });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify OTP
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined; // Clear OTP
    user.resetPasswordExpires = undefined; // Clear OTP expiry
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error('Error in verifyOtpAndResetPassword:', error); // Log error for debugging
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}



const verifyRecaptcha = async (req, res, next) => {
  console.log("Incoming reCAPTCHA Token: ", req.body.recaptchaToken); // Log the token received in the request body
 
  const recaptchaResponse = req.body["recaptchaToken"];
  if (!recaptchaResponse) {
    console.log("Error: reCAPTCHA response token not provided");
    return res.status(400).json({
      success: false,
      message: "reCAPTCHA response is required",
    });
  }
 
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
 
    if (!secretKey) {
      console.error(
        "Error: RECAPTCHA_SECRET_KEY is not set in the environment"
      );
      return res.status(500).json({
        success: false,
        message: "Server misconfiguration: Missing reCAPTCHA secret key",
      });
    }
 
    console.log("Sending verification request to Google reCAPTCHA API...");
 
    // Send verification request to Google's reCAPTCHA API
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: recaptchaResponse,
        },
      }
    );
 
    const data = response.data;
 
    console.log(
      "Google reCAPTCHA API Response:",
      JSON.stringify(data, null, 2)
    ); // Log the detailed API response
 
    // Check reCAPTCHA success
    if (data.success) {
      console.log("reCAPTCHA verification succeeded");
      return next();
    } else {
      console.warn("reCAPTCHA verification failed:", data["error-codes"]);
 
      // Handle specific reCAPTCHA error codes
      if (data["error-codes"]?.includes("timeout-or-duplicate")) {
        return res.status(401).json({
          success: false,
          message:
            "CAPTCHA expired or duplicate. Please refresh the CAPTCHA and try again.",
        });
      }
 
      return res.status(401).json({
        success: false,
        message: "reCAPTCHA verification failed",
        errors: data["error-codes"], // Include error codes for debugging
      });
    }
  } catch (error) {
    console.error("Error occurred while verifying reCAPTCHA:", error.message);
    console.error("Full Error Details:", error); // Log the complete error object for debugging
 
    res.status(500).json({
      success: false,
      message: "Error verifying reCAPTCHA",
      error: error.message, // Include the error message for more insight
    });
  }
};
 

const uploadProfilePicture = async (req, res) => {
  // const id = req.user.id;
  console.log(req.files);
  const { profilePicture } = req.files;

  if (!profilePicture) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image',
    });
  }

  //  Upload the image
  // 1. Generate new image name
  const imageName = `${Date.now()}-${profilePicture.name}`;

  // 2. Make a upload path (/path/upload - directory)
  const imageUploadPath = path.join(
    __dirname,
    `../public/profile_pictures/${imageName}`
  );

  // Ensure the directory exists
  const directoryPath = path.dirname(imageUploadPath);
  fs.mkdirSync(directoryPath, { recursive: true });

  try {
    // 3. Move the image to the upload path
    profilePicture.mv(imageUploadPath);

    //  send image name to the user
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      profilePicture: imageName,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error,
    });
  }
};


// edit user profile
const editUserProfile = async (req, res) => {
  const { userName, email, phone, profilePicture } = req.body;
  const userId = req.user.id;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profilePicture = profilePicture || user.profilePicture;




    await user.save();

    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
};




module.exports = {
  createUser,
  loginUser,
  getToken,
  getCurrentUser,
  forgotPassword,
  verifyOtpAndResetPassword,
  uploadProfilePicture,
  editUserProfile,
  verifyRecaptcha,
  resendLoginOtp,
  verifyRegisterOtp,
  loginOtp

};
