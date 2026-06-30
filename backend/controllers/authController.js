const User = require("../models/User");
const jwt  = require("jsonwebtoken");

// Generate JWT — now includes role in payload
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },           // ← role added to payload
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// -------------------------------------------------------
// @route   POST /api/auth/register
// @desc    Register a normal user
// @access  Public
// -------------------------------------------------------
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // role defaults to "user" automatically from schema
        const user = await User.create({ username, email, password });

        const token = generateToken(user._id, user.role);
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id:       user._id,
                username: user.username,
                email:    user.email,
                role:     user.role      // ← send role to frontend
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/auth/register-admin
// @desc    Register an admin user (protected by ADMIN_SECRET)
// @access  Semi-private — needs ADMIN_SECRET from .env
// -------------------------------------------------------
const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;

        // Check admin secret key — only people who know this can create admins
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: "Invalid admin secret" });
        }

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // role explicitly set to "admin"
        const user = await User.create({ username, email, password, role: "admin" });

        const token = generateToken(user._id, user.role);
        res.status(201).json({
            message: "Admin registered successfully",
            token,
            user: {
                id:       user._id,
                username: user.username,
                email:    user.email,
                role:     user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------------------------------------------
// @route   POST /api/auth/login
// @desc    Login — works for both users and admins
// @access  Public
// -------------------------------------------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
 
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
 
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
 
        // ✅ ADDED — update lastLogin timestamp every time user logs in
        user.lastLogin = Date.now();
        await user.save();
 
        const token = generateToken(user._id, user.role);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id:       user._id,
                username: user.username,
                email:    user.email,
                role:     user.role
            }
        });
 
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { register, registerAdmin, login };