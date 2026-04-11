const User = require('../models/User');
const Project = require('../models/Project');
const logActivity = require('../utils/activityLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  let users;

  if (req.user.role === 'admin') {
    // Admin sees all users
    users = await User.find({}).select('-password');
  } else {
    // Employee sees only teammates in same projects
    const myProjects = await Project.find({ assignedMembers: req.user._id });
    const teammateIds = [...new Set(myProjects.flatMap(p => p.assignedMembers.map(m => m.toString())))];
    
    users = await User.find({ _id: { $in: teammateIds } }).select('-password');
  }

  res.json(users);
};

// @desc    Add new employee
// @route   POST /api/users
// @access  Private/Admin
const addEmployee = async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'employee'
  });

  if (user) {
    await logActivity(req.user._id, req.user.name, 'added team member', name);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

module.exports = { getUsers, addEmployee };
