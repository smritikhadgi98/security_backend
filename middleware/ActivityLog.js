const Log = require("../models/logModel");

const logRequest = async (req, res, next) => {
  // Check if req.user exists and get the username or email
  const username = "smritikhadgi07@gmail.com" ;
  // const username = req.user ? req.user.userName || req.user.email || "Unknown User" : "Unknown User";

  // Log entry details
  const logEntry = new Log({
    username: username,
    url: req.originalUrl,
    method: req.method,
    role: req.user?.role  || "User", // Dynamically set role
    status: res.statusCode,
    time: new Date(),

    headers: req.headers, // Include headers
    device: req.headers["user-agent"], // Include device information
    ipAddress: req.ip, // Include IP address
  });

  try {
    await logEntry.save(); // Save the log entry to the database
  } catch (error) {
    console.error("Error logging request:", error.message); // Log the error if saving fails
  }

  next(); // Proceed to the next middleware or request handler
};

module.exports = {
  logRequest
};
