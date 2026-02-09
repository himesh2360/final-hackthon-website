const express = require('express');
const router = express.Router();
const {
    getAllIssues,
    updateIssueStatus,
    assignDepartment,
    getDepartments,
    createDepartment,
    getUsers,
    updateUserRole
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin, isSuperAdmin } = require('../middleware/rbac');

// All routes require admin access
router.use(protect);
router.use(isAdmin);

// Issues management
router.get('/issues', getAllIssues);
router.patch('/issues/:id/status', updateIssueStatus);
router.patch('/issues/:id/assign', assignDepartment);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);

// User management (super admin only)
router.get('/users', isSuperAdmin, getUsers);
router.patch('/users/:id/role', isSuperAdmin, updateUserRole);

module.exports = router;
