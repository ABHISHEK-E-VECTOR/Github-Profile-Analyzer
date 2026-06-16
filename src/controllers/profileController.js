const { analyzeProfile } = require('../services/githubService');
const profileModel = require('../models/profileModel');

// POST /api/profiles/analyze
// Analyze a GitHub username and store insights in the database
const analyzeAndStoreProfile = async (req, res, next) => {
    try {
        const { username } = req.body;

        // Fetch profile data from GitHub API
        const { profile, topRepos, languages } = await analyzeProfile(username);

        // Store/update the profile in MySQL
        const profileId = await profileModel.upsertProfile(profile);

        // Store top repos and languages
        await profileModel.replaceTopRepos(profileId, topRepos);
        await profileModel.replaceLanguages(profileId, languages);

        // Fetch the full stored profile to return
        const storedProfile = await profileModel.getProfileById(profileId);

        res.status(201).json({
            success: true,
            message: `Profile for '${username}' analyzed and stored successfully.`,
            data: storedProfile
        });
    } catch (error) {
        // Handle GitHub user-not-found (404) specifically
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                success: false,
                message: `GitHub user '${req.body.username}' not found.`
            });
        }
        // Handle GitHub rate limiting
        if (error.response && error.response.status === 403) {
            return res.status(429).json({
                success: false,
                message: 'GitHub API rate limit exceeded. Please try again later.'
            });
        }
        next(error);
    }
};

// GET /api/profiles
// Fetch all analyzed profiles (summary list)
const getAllProfiles = async (req, res, next) => {
    try {
        const profiles = await profileModel.getAllProfiles();
        res.status(200).json({
            success: true,
            count: profiles.length,
            data: profiles
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/profiles/:id
// Fetch a single analyzed profile by ID
const getSingleProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const profile = await profileModel.getProfileById(id);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: `Profile with id '${id}' not found.`
            });
        }
        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { analyzeAndStoreProfile, getAllProfiles, getSingleProfile };
