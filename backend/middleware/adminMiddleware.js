// adminMiddleware.js
// Use AFTER protect middleware — protect sets req.user first
// then adminOnly checks if that user is an admin

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); // ✅ user is admin, continue
    } else {
        res.status(403).json({ message: "Admin access only" });
    }
};

module.exports = { adminOnly };