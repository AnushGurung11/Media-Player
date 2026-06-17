const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check if token exists in request header
        if (req.headers.authorization && 
            req.headers.authorization.startsWith("Bearer")) {
            
            // 2. Extract token from "Bearer eyJhbG..."
            token = req.headers.authorization.split(" ")[1];
        }

        // 3. If no token found, block the request
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        // 4. Verify the token using JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //    decoded = { id: "64abc123", iat: ..., exp: ... }

        // 5. Find the user from DB using id inside token
        req.user = await User.findById(decoded.id).select("-password");
        //                                          ↑
        //                              exclude password from result

        // 6. Call next() — pass control to the actual route
        next();

    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = { protect };