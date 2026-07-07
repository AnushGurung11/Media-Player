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
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// The user is only online for 15 minutes after loging in and later is calcuated in last login
userSchema.methods.isOnline = function () {
  const FIFTEEN_MIN = 15 * 60 * 1000;
  return Date.now() - new Date(this.lastLogin).getTime() < FIFTEEN_MIN;
};

module.exports = mongoose.model("User", userSchema);