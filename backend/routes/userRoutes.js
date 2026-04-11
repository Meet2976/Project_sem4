const express = require('express');
const router = express.Router();
const { getUsers, addEmployee } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, getUsers)
  .post(protect, admin, addEmployee);

module.exports = router;
