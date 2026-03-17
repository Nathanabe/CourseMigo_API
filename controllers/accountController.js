const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const filterFields = require("../utils/filterFields");
const Account = require("../models/Account");
const sendEmail = require("../utils/sendEmail");


// Update Account Controller

exports.updateAccount = asyncHandler(async (req, res) => {
  const accountId = req.params.id;

  if (req.user.id !== accountId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  let updates = filterFields(req.body, "name", "email", "password");

  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }

  const updatedAccount = await Account.findByIdAndUpdate(accountId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedAccount) return res.status(404).json({ message: "Account not found" });

  res.status(200).json({
    success: true,
    message: "Account updated successfully",
    data: updatedAccount,
  });
});


// Disable Account Controller

exports.disableAccount = asyncHandler(async (req, res) => {
  const accountId = req.params.id;

  const account = await Account.findById(accountId);
  if (!account) return res.status(404).json({ message: "Account not found" });

  if (account.account_status === "disabled") {
    return res.status(400).json({ message: "Account is already disabled" });
  }

  account.account_status = "disabled";
  await account.save();

  res.status(200).json({
    success: true,
    message: "Account disabled successfully",
    data: account,
  });
});


// Send Verification Email

exports.sendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const account = await Account.findOne({ email });
  if (!account || account.email_verified) {
    return res.status(200).json({
      success: true,
      message: "If an account exists, a verification email has been sent",
    });
  }

  const token = jwt.sign({ id: account._id, type: "email_verification" }, process.env.JWT_SECRET, { expiresIn: "10m" });

  const verificationUrl = `${process.env.BASE_URL}/api/account/verify-email?token=${token}`;
  const message = `Please verify your email by clicking this link: ${verificationUrl}`;

  await sendEmail(account.email, "Email Verification", message);

  res.status(200).json({
    success: true,
    message: "If an account exists, a verification email has been sent",
  });
});


// Verify Email

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "email_verification") return res.status(400).json({ message: "Invalid token type" });

    const account = await Account.findById(decoded.id);
    if (!account) return res.status(400).json({ message: "Invalid token or account not found" });

    if (account.email_verified) return res.status(400).json({ message: "Email already verified" });

    account.email_verified = true;
    await account.save();

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});


// Register

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await Account.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "Email already in use" });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = await Account.create({
    name,
    email,
    password: hashedPassword,
    account_status: "active",
    email_verified: false,
    role: "user",
  });

  const token = jwt.sign({ id: newAccount._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(201).json({ success: true, message: "Account registered successfully", data: { account: newAccount, token } });
});


// Login

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await Account.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.status(200).json({ success: true, message: "Login successful", data: { account: user, token } });
});


// Reset Password

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const account = await Account.findOne({ email });
  if (!account) return res.status(400).json({ message: "Account not found" });

  const salt = await bcrypt.genSalt(10);
  account.password = await bcrypt.hash(newPassword, salt);
  await account.save();

  res.status(200).json({ success: true, message: "Password reset successfully" });
});  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const account = await Account.findById(decoded.id);
    if (!account) return res.status(400).json({ message: "Invalid token or account not found" });

    account.email_verified = true;
    await account.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error });
  }
};
