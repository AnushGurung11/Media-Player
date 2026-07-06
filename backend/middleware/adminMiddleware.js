// This middle ware is checking for the role of the user
// next is a param sent to the middleware

const adminOnly = (req, res, next) => {

    // From the HTTP header we get the user and we get the role of the use
    if (req.user && req.user.role === "admin") {
        console.info("Admin is logged in."); 
        next(); 
    } else {
        // If the user role is not of admin then this message will be displayed
        console.info("Need admin role for access")
        // 403 status code is for restricting unauthorized access
        res.status(403).json({ message: "Admin access only" });
    }
};

//  Exporting the function
module.exports = { adminOnly };