const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const { updateAccountSchema, registerSchema, loginSchema } = require("../validators/accountValidator");

// -----------------------
// Account Management Routes
// -----------------------

// Update account - protected & validated
router.put(
  "/update/:id",
  protect,                         // Auth middleware
  validate(updateAccountSchema),   // Input validation
  accountController.updateAccount
);

// Disable account - protected & role-based (only admin can disable)
router.put(
  "/disable/:id",
  protect,
  authorize("admin"),             // Only admins can disable accounts
  accountController.disableAccount
);

// Send verification email - protected & rate-limited if needed
router.post(
  "/send-verification",
  protect,
  accountController.sendVerificationEmail
);

// Verify email - no auth needed
router.get("/verify-email", accountController.verifyEmail);

// -----------------------
// Authentication Routes
// -----------------------

// Register a new user
router.post(
  "/register",
  validate(registerSchema),        // Validate registration input
  accountController.register
);

// User login
router.post(
  "/login",
  validate(loginSchema),           // Validate login input
  accountController.login
);

// Reset password
router.post(
  "/reset-password",
  validate(loginSchema),           // You can create a separate reset schema if needed
  accountController.resetPassword
);

module.exports = router;
