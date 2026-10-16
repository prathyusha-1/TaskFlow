import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = express.Router();
const allowedStatuses = ["Pending", "In Progress", "Completed"];
const allowedPriorities = ["Low", "Medium", "High"];

router.get("/", async (req, res, next) => {
  try {
    const { search = "", status = "All" } = req.query;
    const filter = {};
    if (status !== "All") {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status filter." });
      }
      filter.status = status;
    }
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } }
      ];
    }
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, description = "", priority = "Medium", status = "Pending", dueDate = null } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }
    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority." });
    }
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const task = await Task.create({ title, description, priority, status, dueDate: dueDate || null });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }
    const updates = {};
    const { title, description, priority, status, dueDate } = req.body;
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Task title cannot be empty." });
      }
      updates.title = title.trim();
    }
    if (description !== undefined) updates.description = description;
    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) return res.status(400).json({ message: "Invalid priority." });
      updates.priority = priority;
    }
    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) return res.status(400).json({ message: "Invalid status." });
      updates.status = status;
    }
    if (dueDate !== undefined) updates.dueDate = dueDate || null;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
