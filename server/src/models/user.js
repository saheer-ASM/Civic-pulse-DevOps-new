import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    email: { type: String, required: true, unique: true, lowercase: true }, //unique email use as username
    password: { type: String, required: true, minlength: 6 },  // minimum length of 6 characters
    role: { type: String, enum: ["citizen", "authority"], default: "citizen" }, 
    department: { type: String, default: null }, // only for authority
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
