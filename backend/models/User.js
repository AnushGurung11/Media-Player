const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  // ← NEW — tracks last login time, used to determine "active" status
  lastLogin: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true }); // ← also adding timestamps for createdAt (join date)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// "Active" = logged in within the last 15 minutes
userSchema.methods.isOnline = function () {
  const FIFTEEN_MIN = 15 * 60 * 1000;
  return Date.now() - new Date(this.lastLogin).getTime() < FIFTEEN_MIN;
};

module.exports = mongoose.model("User", userSchema);