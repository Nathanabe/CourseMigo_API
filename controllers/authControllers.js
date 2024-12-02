const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { login, register, updateUser, disableUser, resetPassword, verifyEmail } = require("../controllers/authControllers");

//Enviroment variables
const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL  = process.env.BASE_URL;

//Register
exports.register = async (req, res) => {
    try{
        const { name, surname, email, password, role } = req.body;

        // Hash password
        const hashedpassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            surname,
            email,
            password: hashedpassword,
            role,
        });

        await user.save();

        // Generate verification token
        const token = jwt.sign({ email }, JWT_SECRET, { expiration: "1h" });

        // Send email verification link
        await sendEmail(email, "verify your email", `${BASE_URL}/verify/${token}`);

        res.status(201).json({ message: "User registered successfully! Please verify your email." });
} catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Logim
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found." });
  
      if (!user.isVerified) return res.status(403).json({ error: "Please verify your email." });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });
  
      // Generate JWT token
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  
      res.json({ message: "Login successful!", token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Update user
  exports.updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      const user = await User.findByIdAndUpdate(id, updates, { new: true });
      res.json({ message: "User updated successfully!", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Disable user
  exports.disableUser = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
      res.json({ message: "User disabled successfully!", user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Password Reset
  exports.resetPassword = async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
  
      res.json({ message: "Password reset successfully!" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // Verify email
  exports.verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;
  
      const { email } = jwt.verify(token, JWT_SECRET);
  
      const user = await User.findOneAndUpdate({ email }, { isVerified: true }, { new: true });
      res.json({ message: "Email verified successfully!", user });
    } catch (error) {
      res.status(400).json({ error: "Invalid or expired token." });
    }
  };
  