const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

const githubClient = axios.create({
    baseURL: GITHUB_API_BASE,
    headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Profile-Analyzer'
    },
    timeout: 10000
});

// Fetch public profile data for a given GitHub username
const fetchUserProfile = async (username) => {
    const { data } = await githubClient.get(`/users/${username}`);
    return data;
};

// Fetch the user's repositories (sorted by stars, limited to top 10)
const fetchUserRepos = async (username) => {
    const { data } = await githubClient.get(
        `/users/${username}/repos?sort=stars&direction=desc&per_page=10`
    );
    return data.map((repo) => ({
        repo_name: repo.name,
        repo_url: repo.html_url,
        description: repo.description || null,
        language: repo.language || null,
        stars: repo.stargazers_count,
        forks: repo.forks_count
    }));
};

// Aggregate languages from the user's repos
const fetchUserLanguages = async (username) => {
    const { data: repos } = await githubClient.get(
        `/users/${username}/repos?sort=stars&direction=desc&per_page=30`
    );
    const langMap = {};
    repos.forEach((repo) => {
        if (repo.language) {
            langMap[repo.language] = (langMap[repo.language] || 0) + 1;
        }
    });
    return Object.entries(langMap)
        .map(([language, usage_count]) => ({ language, usage_count }))
        .sort((a, b) => b.usage_count - a.usage_count);
};

// Build a complete profile analysis object
const analyzeProfile = async (username) => {
    const userProfile = await fetchUserProfile(username);
    const topRepos = await fetchUserRepos(username);
    const languages = await fetchUserLanguages(username);

    return {
        profile: {
            github_username: userProfile.login,
            full_name: userProfile.name || null,
            bio: userProfile.bio || null,
            avatar_url: userProfile.avatar_url || null,
            profile_url: userProfile.html_url || null,
            company: userProfile.company || null,
            location: userProfile.location || null,
            blog: userProfile.blog || null,
            twitter_username: userProfile.twitter_username || null,
            public_repos: userProfile.public_repos,
            public_gists: userProfile.public_gists,
            followers: userProfile.followers,
            following: userProfile.following,
            account_created_at: userProfile.created_at
                ? new Date(userProfile.created_at).toISOString().slice(0, 19).replace('T', ' ')
                : null
        },
        topRepos,
        languages
    };
};

module.exports = { analyzeProfile };
