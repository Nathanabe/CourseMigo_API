const express = require("express")
const { login, register, updateUser, disableUser, resetPassword, verifyEmail } = require("../controllers/authControllers");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/update/:id", updateUser),
router.post("/reset-password", resetPassword);
router.post("/verify/:token", verifyEmail);

module.exports = router;