const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true, // Cannot use the same email twice!
    match: /.+\@.+\..+/
  },
  age: {
    type: Number,
    min: 0,
    max: 120
  },
  hobbies: [String],
  bio: String,
  userId: {
    type: String,
    unique: true // Cannot use the same ID twice!
  },
  createdAt: {
    type: Date,
    default: Date.now
   
  }
});

// Indexes
userSchema.index({ name: 1 });
userSchema.index({ email: 1, age: -1 });
userSchema.index({ hobbies: 1 });
userSchema.index({ bio: "text" });
userSchema.index({ userId: "hashed" });

module.exports = mongoose.model("User", userSchema);