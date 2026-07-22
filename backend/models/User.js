const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: {
    type: String,
    // Only required for email/password accounts — Google accounts have no password
    required: function () { return !this.googleId; }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // allows many docs with no googleId without violating uniqueness
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Google-only account, no password to match
  return await bcrypt.compare(enteredPassword, this.password);
};

// The user is only online for 15 minutes after loging in and later is calcuated in last login
userSchema.methods.isOnline = function () {
  const FIFTEEN_MIN = 15 * 60 * 1000;
  return Date.now() - new Date(this.lastLogin).getTime() < FIFTEEN_MIN;
};

module.exports = mongoose.model("User", userSchema);