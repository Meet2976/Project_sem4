const Project = require('../models/Project');
const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  let projects;

  if (req.user.role === 'admin') {
    // Admin sees all projects
    projects = await Project.find({}).populate('assignedMembers', 'name email role');
  } else {
    // Employee sees only assigned projects
    projects = await Project.find({ assignedMembers: req.user._id }).populate('assignedMembers', 'name email role');
  }

  res.json(projects);
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { name, description, status, dueDate, assignedMembers } = req.body;

  const project = await Project.create({
    name,
    description,
    status: status || 'active',
    dueDate,
    assignedMembers: assignedMembers || [],
    createdBy: req.user._id
  });

  if (project) {
    await logActivity(req.user._id, req.user.name, 'created project', name);
    res.status(201).json(project);
  } else {
    res.status(400).json({ message: 'Invalid project data' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    project.status = req.body.status || project.status;
    project.dueDate = req.body.dueDate || project.dueDate;
    project.assignedMembers = req.body.assignedMembers || project.assignedMembers;

    const updatedProject = await project.save();
    await logActivity(req.user._id, req.user.name, 'updated project', project.name);
    res.json(updatedProject);
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (project) {
    const projectName = project.name;
    await Project.deleteOne({ _id: req.params.id });
    await Task.deleteMany({ projectId: req.params.id });
    await logActivity(req.user._id, req.user.name, 'deleted project', projectName);
    res.json({ message: 'Project removed' });
  } else {
    res.status(404).json({ message: 'Project not found' });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
