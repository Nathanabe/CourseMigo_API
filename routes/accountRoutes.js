const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const { validate } = require("../middlewares/validateMiddleware");
const {
  updateAccountSchema,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} = require("../validators/accountValidator");

// Update account (user must be logged in)
router.put(
  "/update/:id",
  protect,                        // JWT auth
  validate(updateAccountSchema),  // Validate input
  accountController.updateAccount
);

// Disable account (admin only)
router.put(
  "/disable/:id",
  protect,
  authorize("admin"),
  accountController.disableAccount
);

// Send verification email
router.post("/send-verification", protect, accountController.sendVerificationEmail);

// Verify email
router.get("/verify-email", accountController.verifyEmail);

// Register new user
router.post("/register", validate(registerSchema), accountController.register);

// Login
router.post("/login", validate(loginSchema), accountController.login);

// Reset password
router.post("/reset-password", validate(resetPasswordSchema), accountController.resetPassword);

module.exports = router;
