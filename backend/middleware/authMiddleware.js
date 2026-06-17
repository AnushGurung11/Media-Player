// Adding jwt 
const jwt = require("jsonwebtoken");
// User model from the models
const User = require("../models/User");

// creating async method 
const protect = async (req, res, next) => {

    try {

        // Temp variable
        let token;

        // 1. Check if token exists in request header
        if (req.headers.authorization && 
            req.headers.authorization.startsWith("Bearer")) {
            
            // 2. Extract token from "Bearer eyJhbG..."
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // Decoded JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Using the JWT token we are finding the actual userid and removes the password from the response
        // the "-" tells to remove
        // .select actually selects the field 
        // password is the field
        req.user = await User.findById(decoded.id).select("-password");

        next();

    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// Export the only protect function 
module.exports = { protect };