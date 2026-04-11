const Activity = require('../models/Activity');

const logActivity = async (userId, userName, action, target) => {
  try {
    await Activity.create({
      userId,
      userName,
      action,
      target
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = logActivity;
