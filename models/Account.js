const mongoose = require("mongoose");
const crypto = require("crypto");

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin', 'subscriber'],
    default: 'student',
  },
  account_status: {
    type: String,
    enum: ['active', 'inactive', 'disabled', 'deleted'],
    default: 'active',
  },
  email_verified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
});

// Generate email verification token
accountSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 3600000; // 1-hour expiry
  return token;
};

module.exports = mongoose.model("Account", accountSchema);