const jwt = require('jsonwebtoken');

// Authentication Guard Middleware
const authGuard = (req, res, next) => {
  console.log('Authorization Header:', req.headers.authorization); // Debugging: Log Authorization header

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization header not found!',
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token not found!',
    });
  }

  try {
    // Verify the token using JWT_SECRET from environment variables
    const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded User Data:', decodedUserData); // Debugging: Log decoded token

    // Attach decoded user data to the request object
    req.user = decodedUserData;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token Verification Error:', error.message); // Log the error
    return res.status(401).json({
      success: false,
      message: 'Not authenticated!',
    });
  }
};



// Admin Guard Middleware
const adminGuard = (req, res, next) => {
    console.log('Authorization Header:', req.headers.authorization); // Debugging: Check incoming data

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Authorization header not found!",
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token not found!",
        });
    }

    try {
        const decodedUserData = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded User Data:', decodedUserData); // Debugging: Check decoded token
        req.user = decodedUserData;

        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Permission denied",
            });
        }

        next();
    } catch (error) {
        console.error('Token Verification Error:', error.message); // Log the error
        return res.status(401).json({
            success: false,
            message: "Not authenticated!",
        });
    }
};



module.exports = {
    authGuard,
    adminGuard

}
