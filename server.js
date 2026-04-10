const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

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
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
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

// ✅ DELETE
app.delete("/deleteUser/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json("User deleted");
});

// 🔍 QUERYING & FILTERING
app.get("/search", async (req, res) => {
  const { name, age, hobby, text } = req.query;

  const query = {};
  if (name) query.name = name;
  if (age) query.age = age;
  if (hobby) query.hobbies = hobby;
  if (text) query.$text = { $search: text };

  const result = await User.find(query);
  res.json(result);
});
module.exports = app;
