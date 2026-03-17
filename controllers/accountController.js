const bcrypt = require("bcrypt");
const asyncHandler = require("../utils/asyncHandler");
const filterFields = require("../utils/filterFields");
const Account = require("../models/Account");

// Update Account Controller

exports.updateAccount = asyncHandler(async (req, res) => {
  const accountId = req.params.id;

  // Authorization check - user can only update their own account
  if (req.user.id !== accountId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  // Only allow safe fields to be updated
  let updates = filterFields(req.body, "name", "email", "password");

  // Hash password if present
  if (updates.password) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(updates.password, salt);
  }

  // Update account
  const updatedAccount = await Account.findByIdAndUpdate(accountId, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedAccount) {
    return res.status(404).json({ message: "Account not found" });
  }

  res.status(200).json({
    success: true,
    message: "Account updated successfully",
    data: updatedAccount,
  });
});

// Disable Account Controller

exports.disableAccount = asyncHandler(async (req, res) => {
  const accountId = req.params.id;

  // Authorization check handled via route middleware (admin only)

  const account = await Account.findById(accountId);
  if (!account) {
    return res.status(404).json({ message: "Account not found" });
  }

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
});  const { token } = req.query;

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
