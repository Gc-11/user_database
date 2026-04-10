const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // 1. Added for path handling
require("dotenv").config();

const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect MongoDB
// We don't await this globally because Vercel functions should connect per-request 
// or reuse the cached connection. Mongoose handles this well.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Connection Error:", err));

// --- FRONTEND ROUTE ---
// 2. This is what stops the "Cannot GET /" error
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ CREATE (POST)
app.post("/addUser", async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json(err.message);
  }
});

// ✅ READ (GET)
// ✅ READ (GET) - Optimized for Vercel
app.get("/users", async (req, res) => {
  try {
    // Check if we are connected; if not, wait for connection
    if (mongoose.connection.readyState !== 1) {
       await mongoose.connect(process.env.MONGO_URI);
    }
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("GET_USERS_ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ UPDATE (PUT)
app.put("/updateUser/:id", async (req, res) => {
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

/// ✅ DELETE - Hardened for Serverless
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    // Safety check: Ensure DB is connected before deleting
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" }); // Returning an object is better practice
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 QUERYING & FILTERING - Hardened for Serverless
app.get("/search", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const { name, age, hobby, text } = req.query;
    const query = {};
    
    if (name) query.name = new RegExp(name, 'i'); // 'i' makes it case-insensitive
    if (age) query.age = age;
    if (hobby) query.hobbies = hobby;
    if (text) query.$text = { $search: text };

    const result = await User.find(query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3. IMPORTANT: Only listen if NOT on Vercel
// Vercel manages the port and execution context itself.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// 4. Export for Vercel's serverless handler
module.exports = app;