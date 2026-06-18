// Importing the Modules from node modules
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// A func for genrating the JWT token. 
const generateToken = (userId) => {
    // function to create the JWT token 
    // A JWT token has three parts: header, payload, and signature.
    return jwt.sign(
        // Payload
        { id: userId },                     // payload — what we store inside the token
        // Secret key  
        process.env.JWT_SECRET,             // secret key from .env
        { expiresIn: "7d" }                 // token expires in 7 days
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const register = async (req, res, next) => {
    try {
        // Taking the username, email and password from the req send by client side.
        const { username, email, password } = req.body;

        console.log("Registering user:", { username, email }); // Debug log

        // 1. Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Create new user
        // Note: password hashing is handled automatically by
        // the pre("save") hook in User.js model
        const user = await User.create({ username, email, password });

        console .log("User created:", user); // Debug log

        // 4. Generate token and send response
        const token = generateToken(user._id);

        console.log("Token generated:", token); // Debug log
        console.log("User created:", user); // Debug log
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

        console.log("Registration successful, token generated"); // Debug log

    } catch (error) {
        console.error("Error in register:", error);
        next(error);
    }
};

// -------------------------------------------------------
// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
// -------------------------------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // 2. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Compare password using bcrypt
        // matchPassword is a method we define on the User model
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. Generate token and send response
        const token = generateToken(user._id);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { register, login };