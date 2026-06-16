const { validationResult } = require('express-validator');

// Middleware to check express-validator results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
        });
    }
    next();
};

// Global error-handling middleware
const errorHandler = (err, req, res, _next) => {
    console.error('Error:', err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = { validate, errorHandler };
