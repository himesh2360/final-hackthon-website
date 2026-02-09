const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    createIssue,
    getIssues,
    getIssue,
    updateIssue,
    deleteIssue,
    getMyIssues,
    getNearbyIssues,
    getMapIssues
} = require('../controllers/issueController');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { toggleUpvote, getUpvoteStatus } = require('../controllers/upvoteController');
const { protect, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Validation
const issueValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    body('category')
        .isIn(['roads', 'water', 'electricity', 'sanitation', 'streetlights', 'drainage', 'garbage', 'public_safety', 'parks', 'other'])
        .withMessage('Invalid category'),
    body('location.lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    body('location.lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude')
];

const commentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters')
];

// Public routes (with optional auth for upvote status)
router.get('/', optionalAuth, getIssues);
router.get('/map', getMapIssues);
router.get('/nearby', getNearbyIssues);
router.get('/:id', optionalAuth, getIssue);
router.get('/:issueId/comments', getComments);

// Protected routes
router.post('/', protect, upload.array('images', 5), issueValidation, createIssue);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, deleteIssue);
router.get('/user/my-issues', protect, getMyIssues);

// Comments
router.post('/:issueId/comments', protect, commentValidation, addComment);
router.delete('/comments/:id', protect, deleteComment);

// Upvotes
router.post('/:issueId/upvote', protect, toggleUpvote);
router.get('/:issueId/upvote', protect, getUpvoteStatus);

module.exports = router;
