# GitHub Profile Analyzer API

A RESTful API built with **Node.js**, **Express**, and **MySQL** that analyzes GitHub user profiles by fetching data from the GitHub API, extracting insights (top repositories, programming languages, profile stats), and storing them in a MySQL database.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [MySQL Database Setup](#mysql-database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
  - [Health Check](#1-health-check)
  - [Analyze a GitHub User](#2-analyze-a-github-user)
  - [Get All Analyzed Profiles](#3-get-all-analyzed-profiles)
  - [Get a Single Profile by ID](#4-get-a-single-profile-by-id)
- [Sample Responses](#sample-responses)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Features

- Analyze any public GitHub user profile
- Fetches profile info, top 10 repositories (by stars), and programming language usage
- Stores and updates analysis results in a MySQL database
- Supports re-analysis (upsert — updates existing profiles with fresh data)
- Input validation with `express-validator`
- Centralized error handling

---

## Tech Stack

| Technology       | Purpose                        |
|------------------|--------------------------------|
| Node.js          | Runtime environment            |
| Express 5        | Web framework                  |
| MySQL2           | Database driver (promise-based)|
| Axios            | HTTP client for GitHub API     |
| dotenv           | Environment variable management|
| express-validator| Request validation             |
| nodemon          | Development auto-restart       |

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) — [Download](https://dev.mysql.com/downloads/)
- **Git** — [Download](https://git-scm.com/)

---

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ABHISHEK-E-VECTOR/Github-Profile-Analyzer.git
   cd Github-Profile-Analyzer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

---

## MySQL Database Setup

1. **Start your MySQL server** and log in:

   ```bash
   mysql -u root -p
   ```

2. **Run the database schema script** included in the project:

   ```sql
   SOURCE database.sql;
   ```

   Or run it directly from the terminal:

   ```bash
   mysql -u root -p < database.sql
   ```

3. **Verify the tables were created:**

   ```sql
   USE github_analyzer;
   SHOW TABLES;
   ```

   You should see three tables:

   | Table       | Description                              |
   |-------------|------------------------------------------|
   | `profiles`  | Stores analyzed GitHub profile insights  |
   | `top_repos` | Stores top repositories per profile      |
   | `languages` | Stores programming language usage stats  |

### Database Schema

**profiles**

| Column             | Type           | Description                      |
|--------------------|----------------|----------------------------------|
| id                 | INT (PK, AI)   | Auto-incremented profile ID      |
| github_username    | VARCHAR(255)   | GitHub username (unique)         |
| full_name          | VARCHAR(255)   | Full name                        |
| bio                | TEXT           | User bio                         |
| avatar_url         | VARCHAR(500)   | Avatar image URL                 |
| profile_url        | VARCHAR(500)   | GitHub profile URL               |
| company            | VARCHAR(255)   | Company name                     |
| location           | VARCHAR(255)   | User location                    |
| blog               | VARCHAR(500)   | Blog/website URL                 |
| twitter_username   | VARCHAR(255)   | Twitter handle                   |
| public_repos       | INT            | Number of public repositories    |
| public_gists       | INT            | Number of public gists           |
| followers          | INT            | Number of followers              |
| following          | INT            | Number of users they follow      |
| account_created_at | DATETIME       | When the GitHub account was made |
| last_analyzed_at   | DATETIME       | When the profile was last analyzed|
| created_at         | DATETIME       | Record creation timestamp        |
| updated_at         | DATETIME       | Record update timestamp          |

**top_repos**

| Column      | Type           | Description                |
|-------------|----------------|----------------------------|
| id          | INT (PK, AI)   | Auto-incremented ID        |
| profile_id  | INT (FK)       | References profiles.id     |
| repo_name   | VARCHAR(255)   | Repository name            |
| repo_url    | VARCHAR(500)   | Repository URL             |
| description | TEXT           | Repository description     |
| language    | VARCHAR(100)   | Primary language           |
| stars       | INT            | Stargazer count            |
| forks       | INT            | Fork count                 |

**languages**

| Column      | Type           | Description                |
|-------------|----------------|----------------------------|
| id          | INT (PK, AI)   | Auto-incremented ID        |
| profile_id  | INT (FK)       | References profiles.id     |
| language    | VARCHAR(100)   | Programming language name  |
| usage_count | INT            | Number of repos using it   |

---

## Environment Variables

1. **Copy the example file** to create your own `.env`:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** with your MySQL credentials:

   ```env
   PORT=3000

   # MySQL Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=github_analyzer
   ```

   | Variable      | Description                   | Default     |
   |---------------|-------------------------------|-------------|
   | `PORT`        | Server port number            | `3000`      |
   | `DB_HOST`     | MySQL server host             | `localhost` |
   | `DB_PORT`     | MySQL server port             | `3306`      |
   | `DB_USER`     | MySQL username                | `root`      |
   | `DB_PASSWORD` | MySQL password                | —           |
   | `DB_NAME`     | Database name                 | `github_analyzer` |

---

## Running the Application

**Development mode** (auto-restarts on file changes):

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

You should see:

```
MySQL database connected successfully.
Server is running on http://localhost:3000
```

---

## API Endpoints

Base URL: `http://localhost:3000`

### 1. Health Check

Returns API status and available endpoints.

```
GET /
```

**Example:**

```bash
curl http://localhost:3000/
```

---

### 2. Analyze a GitHub User

Fetches data from GitHub API, analyzes the profile, and stores it in the database.

```
POST /api/profiles/analyze
```

**Request Body (JSON):**

```json
{
  "username": "torvalds"
}
```

| Field      | Type   | Required | Description                |
|------------|--------|----------|----------------------------|
| `username` | String | Yes      | A valid GitHub username    |

**Example:**

```bash
curl -X POST http://localhost:3000/api/profiles/analyze \
  -H "Content-Type: application/json" \
  -d '{"username": "torvalds"}'
```

**Success Response** — `201 Created`:

```json
{
  "success": true,
  "message": "Profile for 'torvalds' analyzed and stored successfully.",
  "data": {
    "id": 1,
    "github_username": "torvalds",
    "full_name": "Linus Torvalds",
    "bio": "...",
    "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
    "profile_url": "https://github.com/torvalds",
    "company": "Linux Foundation",
    "location": "Portland, OR",
    "public_repos": 6,
    "followers": 230000,
    "following": 0,
    "top_repos": [
      {
        "repo_name": "linux",
        "repo_url": "https://github.com/torvalds/linux",
        "description": "Linux kernel source tree",
        "language": "C",
        "stars": 180000,
        "forks": 55000
      }
    ],
    "languages": [
      { "language": "C", "usage_count": 4 },
      { "language": "Shell", "usage_count": 1 }
    ]
  }
}
```

> If the username already exists in the database, the profile is **updated** with fresh data (upsert).

---

### 3. Get All Analyzed Profiles

Returns a summary list of all previously analyzed profiles.

```
GET /api/profiles
```

**Example:**

```bash
curl http://localhost:3000/api/profiles
```

**Success Response** — `200 OK`:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "github_username": "torvalds",
      "full_name": "Linus Torvalds",
      "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
      "public_repos": 6,
      "followers": 230000,
      "following": 0,
      "last_analyzed_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### 4. Get a Single Profile by ID

Returns full details of a specific analyzed profile, including top repos and languages.

```
GET /api/profiles/:id
```

| Parameter | Type    | Description             |
|-----------|---------|-------------------------|
| `id`      | Integer | The profile ID (≥ 1)   |

**Example:**

```bash
curl http://localhost:3000/api/profiles/1
```

**Success Response** — `200 OK`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "github_username": "torvalds",
    "full_name": "Linus Torvalds",
    "bio": "...",
    "avatar_url": "...",
    "profile_url": "https://github.com/torvalds",
    "company": "Linux Foundation",
    "location": "Portland, OR",
    "blog": "",
    "twitter_username": null,
    "public_repos": 6,
    "public_gists": 0,
    "followers": 230000,
    "following": 0,
    "account_created_at": "2011-09-03 15:26:22",
    "last_analyzed_at": "2025-01-15T10:30:00.000Z",
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z",
    "top_repos": [...],
    "languages": [...]
  }
}
```

---

## Sample Responses

### Error Responses

**Validation Error** — `400 Bad Request`:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "username", "message": "GitHub username is required." }
  ]
}
```

**User Not Found** — `404 Not Found`:

```json
{
  "success": false,
  "message": "GitHub user 'invaliduser123' not found."
}
```

**Profile Not Found** — `404 Not Found`:

```json
{
  "success": false,
  "message": "Profile with id '99' not found."
}
```

**Rate Limit Exceeded** — `429 Too Many Requests`:

```json
{
  "success": false,
  "message": "GitHub API rate limit exceeded. Please try again later."
}
```

**Unknown Route** — `404 Not Found`:

```json
{
  "success": false,
  "message": "Route not found."
}
```

---

## Project Structure

```
github-profile-analyzer/
├── src/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool setup
│   ├── controllers/
│   │   └── profileController.js   # Route handler logic
│   ├── middleware/
│   │   └── errorHandler.js        # Validation & global error handler
│   ├── models/
│   │   └── profileModel.js        # Database queries (CRUD operations)
│   ├── routes/
│   │   └── profileRoutes.js       # API route definitions
│   ├── services/
│   │   └── githubService.js       # GitHub API integration (Axios)
│   └── app.js                     # Express app configuration
├── .env                           # Environment variables (not in Git)
├── .env.example                   # Template for .env
├── .gitignore                     # Git ignore rules
├── database.sql                   # MySQL schema creation script
├── package.json                   # Project dependencies & scripts
└── server.js                      # Application entry point
```

### Architecture Flow

```
Client Request
      │
      ▼
  server.js  ──►  Express App (app.js)
      │
      ▼
  Routes (profileRoutes.js)
      │
      ▼
  Validation Middleware (errorHandler.js)
      │
      ▼
  Controller (profileController.js)
      │
      ├──►  GitHub Service (githubService.js)  ──►  GitHub REST API
      │
      └──►  Profile Model (profileModel.js)    ──►  MySQL Database
```

---

## Error Handling

The API uses a centralized error-handling middleware that catches all unhandled errors and returns a consistent JSON response:

```json
{
  "success": false,
  "message": "Error description"
}
```

Specific error scenarios handled:

| Scenario                    | HTTP Status | Description                         |
|-----------------------------|-------------|-------------------------------------|
| Invalid input               | 400         | Missing or malformed username       |
| GitHub user not found       | 404         | Username doesn't exist on GitHub    |
| Profile not found in DB     | 404         | Requested ID not in database        |
| GitHub API rate limited     | 429         | Too many requests to GitHub API     |
| Unknown route               | 404         | Endpoint doesn't exist              |
| Internal server error       | 500         | Unexpected server/database errors   |

---

## Rate Limiting

The GitHub API allows **60 unauthenticated requests per hour** (from the same IP). If you exceed this, the API will return a `429` response.

To increase the limit, you can add a GitHub Personal Access Token to your `.env`:

```env
GITHUB_TOKEN=your_personal_access_token
```

> This is optional. With a token, the limit increases to **5,000 requests per hour**.

---
