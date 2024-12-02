const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
app.use('/api/auth', authRoutes);

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());   //To parse Json request bodies

// Database Connection
mongoose
    .connect(process.env.MONO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

    // Routes
    app.use("/api/auth", authRoutes);

    // Default Route
    app.get("/", (req, res) => { 
        res.send("Welcome to the API");
    });

    // Start Server
    app.listen(PORT, () => { 
        console.log(`server running on https://localhost:${PORT}`);
    });