import express from "express";
import mongoose from "mongoose";


const commentSchema = new mongoose.Schema({
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User
    message: { type: String, required: true },// comment message
    createdAt: { type: Date, default: Date.now }    
});



const complaintSchema = new mongoose.Schema({
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Reference to the User 
    title: { type: String, required: true }, // complaint title
    description: { type: String, required: true }, // complaint description
    status:{ type: String, enum: ['Registered', 'In-progress', 'Resolved'], default: 'Registered' }, // complaint status
    department: { type: String, required: true },
    comments: [commentSchema] // Array of comments
}

, { timestamps: true }
);
export default mongoose.model("Complaint", complaintSchema);