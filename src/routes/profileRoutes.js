const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/profileController');
const { validate } = require('../middleware/errorHandler');

const router = express.Router();

// POST /api/profiles/analyze  — Analyze a GitHub user profile
router.post(
    '/analyze',
    body('username')
        .trim()
        .notEmpty().withMessage('GitHub username is required.')
        .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/)
        .withMessage('Invalid GitHub username format.'),
    validate,
    controller.analyzeAndStoreProfile
);

// GET /api/profiles  — Get all analyzed profiles
router.get('/', controller.getAllProfiles);

// GET /api/profiles/:id  — Get a single profile by ID
router.get(
    '/:id',
    param('id').isInt({ min: 1 }).withMessage('Profile ID must be a positive integer.'),
    validate,
    controller.getSingleProfile
);

module.exports = router;
