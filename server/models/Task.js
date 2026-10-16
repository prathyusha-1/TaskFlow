import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [120, "Title must be 120 characters or fewer"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description must be 1000 characters or fewer"],
      default: ""
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending"
    },
    dueDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
