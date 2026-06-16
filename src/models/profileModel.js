const { pool } = require('../config/db');

// Insert or update a profile (upsert)
const upsertProfile = async (profileData) => {
    const query = `
        INSERT INTO profiles 
            (github_username, full_name, bio, avatar_url, profile_url, company, 
             location, blog, twitter_username, public_repos, public_gists, 
             followers, following, account_created_at, last_analyzed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            full_name = VALUES(full_name),
            bio = VALUES(bio),
            avatar_url = VALUES(avatar_url),
            profile_url = VALUES(profile_url),
            company = VALUES(company),
            location = VALUES(location),
            blog = VALUES(blog),
            twitter_username = VALUES(twitter_username),
            public_repos = VALUES(public_repos),
            public_gists = VALUES(public_gists),
            followers = VALUES(followers),
            following = VALUES(following),
            account_created_at = VALUES(account_created_at),
            last_analyzed_at = NOW()
    `;
    const values = [
        profileData.github_username,
        profileData.full_name,
        profileData.bio,
        profileData.avatar_url,
        profileData.profile_url,
        profileData.company,
        profileData.location,
        profileData.blog,
        profileData.twitter_username,
        profileData.public_repos,
        profileData.public_gists,
        profileData.followers,
        profileData.following,
        profileData.account_created_at
    ];
    const [result] = await pool.execute(query, values);

    // Return the profile id (insertId for new, or lookup for existing)
    if (result.insertId) return result.insertId;
    const [rows] = await pool.execute(
        'SELECT id FROM profiles WHERE github_username = ?',
        [profileData.github_username]
    );
    return rows[0].id;
};

// Replace top repos for a profile
const replaceTopRepos = async (profileId, repos) => {
    await pool.execute('DELETE FROM top_repos WHERE profile_id = ?', [profileId]);
    if (repos.length === 0) return;
    const values = repos.map(r => [profileId, r.repo_name, r.repo_url, r.description, r.language, r.stars, r.forks]);
    const placeholders = repos.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const query = `INSERT INTO top_repos (profile_id, repo_name, repo_url, description, language, stars, forks) VALUES ${placeholders}`;
    await pool.execute(query, values.flat());
};

// Replace languages for a profile
const replaceLanguages = async (profileId, languages) => {
    await pool.execute('DELETE FROM languages WHERE profile_id = ?', [profileId]);
    if (languages.length === 0) return;
    const values = languages.map(l => [profileId, l.language, l.usage_count]);
    const placeholders = languages.map(() => '(?, ?, ?)').join(', ');
    const query = `INSERT INTO languages (profile_id, language, usage_count) VALUES ${placeholders}`;
    await pool.execute(query, values.flat());
};

// Get all analyzed profiles (summary list)
const getAllProfiles = async () => {
    const [rows] = await pool.execute(
        `SELECT id, github_username, full_name, avatar_url, public_repos, followers, 
                following, last_analyzed_at 
         FROM profiles ORDER BY last_analyzed_at DESC`
    );
    return rows;
};

// Get a single profile with repos and languages
const getProfileById = async (id) => {
    const [profiles] = await pool.execute('SELECT * FROM profiles WHERE id = ?', [id]);
    if (profiles.length === 0) return null;

    const [repos] = await pool.execute(
        'SELECT repo_name, repo_url, description, language, stars, forks FROM top_repos WHERE profile_id = ? ORDER BY stars DESC',
        [id]
    );
    const [languages] = await pool.execute(
        'SELECT language, usage_count FROM languages WHERE profile_id = ? ORDER BY usage_count DESC',
        [id]
    );

    return { ...profiles[0], top_repos: repos, languages };
};

// Get a profile by GitHub username
const getProfileByUsername = async (username) => {
    const [rows] = await pool.execute(
        'SELECT id FROM profiles WHERE github_username = ?',
        [username]
    );
    return rows.length > 0 ? rows[0] : null;
};

module.exports = {
    upsertProfile,
    replaceTopRepos,
    replaceLanguages,
    getAllProfiles,
    getProfileById,
    getProfileByUsername
};
