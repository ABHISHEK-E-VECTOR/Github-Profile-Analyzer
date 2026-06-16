-- GitHub Profile Analyzer Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

-- Main table to store analyzed GitHub profile insights
CREATE TABLE IF NOT EXISTS profiles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    github_username VARCHAR(255) NOT NULL UNIQUE,
    full_name       VARCHAR(255) DEFAULT NULL,
    bio             TEXT DEFAULT NULL,
    avatar_url      VARCHAR(500) DEFAULT NULL,
    profile_url     VARCHAR(500) DEFAULT NULL,
    company         VARCHAR(255) DEFAULT NULL,
    location        VARCHAR(255) DEFAULT NULL,
    blog            VARCHAR(500) DEFAULT NULL,
    twitter_username VARCHAR(255) DEFAULT NULL,
    public_repos    INT DEFAULT 0,
    public_gists    INT DEFAULT 0,
    followers       INT DEFAULT 0,
    following       INT DEFAULT 0,
    account_created_at DATETIME DEFAULT NULL,
    last_analyzed_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table to store top repositories for each profile
CREATE TABLE IF NOT EXISTS top_repos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    profile_id  INT NOT NULL,
    repo_name   VARCHAR(255) NOT NULL,
    repo_url    VARCHAR(500) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    language    VARCHAR(100) DEFAULT NULL,
    stars       INT DEFAULT 0,
    forks       INT DEFAULT 0,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Table to store programming languages used by the user
CREATE TABLE IF NOT EXISTS languages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    profile_id  INT NOT NULL,
    language    VARCHAR(100) NOT NULL,
    usage_count INT DEFAULT 0,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);
