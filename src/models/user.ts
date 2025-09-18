import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true }, // Added name field
  creatorType: { 
    type: String, 
    enum: ["Content Creator", "Musician", "Producer", "Event Planner", "Other"], // Added creatorType field with validation
    required: true 
  },
  age: { 
    type: Number, 
    min: 13, // Minimum age for platform usage
    max: 120, // Reasonable maximum age
    required: false // Optional field
  },
  bio: { 
    type: String, 
    maxlength: 500, // Limit bio to 500 characters
    trim: true, // Automatically trim whitespace
    required: false // Optional field
  }
}, {
  timestamps: true // Add createdAt and updatedAt fields
});

export const User = mongoose.model("User", userSchema);