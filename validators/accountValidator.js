const Joi = require("joi");

// Update account
exports.updateAccountSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  password: Joi.string().min(6),
});

// Registration schema
exports.registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Login schema
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
