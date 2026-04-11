const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let projectCount, taskCount, completedTaskCount, userCount, activities;

    if (req.user.role === 'admin') {
      projectCount = await Project.countDocuments({});
      taskCount = await Task.countDocuments({});
      completedTaskCount = await Task.countDocuments({ status: 'completed' });
      userCount = await User.countDocuments({});
      activities = await Activity.find({}).sort({ timestamp: -1 }).limit(10);
    } else {
      projectCount = await Project.countDocuments({ assignedMembers: req.user._id });
      taskCount = await Task.countDocuments({ assignedTo: req.user._id });
      completedTaskCount = await Task.countDocuments({ assignedTo: req.user._id, status: 'completed' });
      
      const myProjects = await Project.find({ assignedMembers: req.user._id });
      const teammateIds = [...new Set(myProjects.flatMap(p => p.assignedMembers.map(m => m.toString())))];
      userCount = teammateIds.length;
      
      activities = await Activity.find({ userId: { $in: teammateIds } }).sort({ timestamp: -1 }).limit(10);
    }

    res.json({
      totalProjects: projectCount,
      totalTasks: taskCount,
      completedTasks: completedTaskCount,
      teamMembers: userCount,
      recentActivities: activities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
