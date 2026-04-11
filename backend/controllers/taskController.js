const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  let tasks;

  if (req.user.role === 'admin') {
    // Admin sees all tasks
    tasks = await Task.find({}).populate('assignedTo', 'name email').populate('projectId', 'name');
  } else {
    // Employee sees only assigned tasks
    tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('projectId', 'name');
  }

  res.json(tasks);
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

  const task = await Task.create({
    title,
    description,
    projectId,
    assignedTo: assignedTo || [],
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate,
    createdBy: req.user._id
  });

  if (task) {
    await logActivity(req.user._id, req.user.name, 'created task', title);
    res.status(201).json(task);
  } else {
    res.status(400).json({ message: 'Invalid task data' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    const oldStatus = task.status;
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.projectId = req.body.projectId || task.projectId;
    task.assignedTo = req.body.assignedTo || task.assignedTo;
    task.status = req.body.status || task.status;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;

    const updatedTask = await task.save();
    
    if (oldStatus !== updatedTask.status) {
      await logActivity(req.user._id, req.user.name, `updated status to ${updatedTask.status}`, updatedTask.title);
    } else {
      await logActivity(req.user._id, req.user.name, 'updated task', updatedTask.title);
    }

    res.json(updatedTask);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    const taskTitle = task.title;
    await Task.deleteOne({ _id: req.params.id });
    await logActivity(req.user._id, req.user.name, 'deleted task', taskTitle);
    res.json({ message: 'Task removed' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
