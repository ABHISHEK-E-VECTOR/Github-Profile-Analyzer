const express = require('express');
const profileRoutes = require('./routes/profileRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health-check endpoint
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'GitHub Profile Analyzer API is running.',
        endpoints: {
            analyze: 'POST /api/profiles/analyze   — Analyze a GitHub user',
            allProfiles: 'GET  /api/profiles          — List all analyzed profiles',
            singleProfile: 'GET  /api/profiles/:id      — Get a single profile by ID'
        }
    });
});

// API routes
app.use('/api/profiles', profileRoutes);

// 404 handler for unknown routes
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler (must be registered last)
app.use(errorHandler);

module.exports = app;
