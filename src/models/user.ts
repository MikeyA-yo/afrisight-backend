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
});

export const User = mongoose.model("User", userSchema);