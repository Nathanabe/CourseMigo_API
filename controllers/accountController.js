const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const sendEmail = require("../utils/sendEmail");

// Update Account
exports.updateAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const updates = req.body;

    // If password is being updated, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedAccount = await Account.findByIdAndUpdate(accountId, updates, { new: true });
    if (!updatedAccount) return res.status(404).json({ message: "Account not found" });

    res.status(200).json({ message: "Account updated successfully", updatedAccount });
  } catch (error) {
    res.status(500).json({ message: "Error updating account", error });
  }
};

// Disable Account
exports.disableAccount = async (req, res) => {
  try {
    const accountId = req.params.id;
    const account = await Account.findByIdAndUpdate(accountId, { account_status: "disabled" }, { new: true });

    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json({ message: "Account disabled successfully", account });
  } catch (error) {
    res.status(500).json({ message: "Error disabling account", error });
  }
};

// Send Email Verification
exports.sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const account = await Account.findOne({ email });

    if (!account) return res.status(404).json({ message: "Account not found" });

    // Generate JWT token for email verification
    const token = jwt.sign(
      { id: account._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token valid for 1 hour
    );

    const verificationUrl = `${process.env.BASE_URL}/api/account/verify-email?token=${token}`;
    const message = `Please verify your email by clicking this link: ${verificationUrl}`;

    await sendEmail(account.email, "Email Verification", message);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    res.status(500).json({ message: "Error sending verification email", error });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
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
