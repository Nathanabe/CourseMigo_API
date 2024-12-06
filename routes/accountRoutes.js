const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

// Routes for account management
router.put("/update/:id", accountController.updateAccount);
router.put("/disable/:id", accountController.disableAccount);
router.post("/send-verification", accountController.sendVerificationEmail);
router.get("/verify-email", accountController.verifyEmail);

// Routes for user authentication
router.post("/register", accountController.register);           // Register a new user
router.post("/login", accountController.login);                 // User login
router.post("/reset-password", accountController.resetPassword); // Reset user password

module.exports = router;