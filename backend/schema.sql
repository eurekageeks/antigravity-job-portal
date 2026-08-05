CREATE DATABASE IF NOT EXISTS firstjobdb;
USE firstjobdb;

-- Drop tables in order of dependencies if they exist
DROP TABLE IF EXISTS job_reviews;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS job_alerts;
DROP TABLE IF EXISTS candidate_certifications;
DROP TABLE IF EXISTS candidate_experience;
DROP TABLE IF EXISTS candidate_education;
DROP TABLE IF EXISTS candidate_skills;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS employers;
DROP TABLE IF EXISTS candidate_profiles;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'employer', 'admin') NOT NULL,
    approval_status ENUM('pending', 'approved', 'rejected', 'blocked') DEFAULT 'pending',
    blocked BOOLEAN DEFAULT FALSE,
    google_id VARCHAR(255) UNIQUE NULL,
    avatar_url VARCHAR(512) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Candidate Profiles Table
CREATE TABLE candidate_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255) DEFAULT NULL,
    about_me TEXT DEFAULT NULL,
    resume_url VARCHAR(255) DEFAULT NULL,
    expected_salary DECIMAL(12, 2) DEFAULT NULL,
    notice_period VARCHAR(50) DEFAULT 'Immediate',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Employers Table
CREATE TABLE employers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    industry VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Jobs Table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employer_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    skills TEXT NOT NULL, -- Stored as a JSON-encoded string or simple comma-separated string
    salary_min DECIMAL(12, 2) DEFAULT NULL,
    salary_max DECIMAL(12, 2) DEFAULT NULL,
    experience_min INT DEFAULT 0,
    experience_max INT DEFAULT 0,
    job_type ENUM('Full Time', 'Part Time', 'Internship', 'Contract') NOT NULL,
    work_mode ENUM('Remote', 'Onsite', 'Hybrid') NOT NULL,
    status ENUM('pending_approval', 'approved', 'rejected', 'closed') DEFAULT 'pending_approval',
    vacancies INT DEFAULT 1,
    last_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

-- 5. Applications Table
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    candidate_id INT NOT NULL,
    resume VARCHAR(255) NOT NULL, -- URL or path to uploaded resume file
    cover_letter TEXT DEFAULT NULL,
    status ENUM('Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected') DEFAULT 'Applied',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    CONSTRAINT unique_job_candidate UNIQUE(job_id, candidate_id)
);

-- 6. Candidate Skills Table
CREATE TABLE candidate_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    level ENUM('Beginner', 'Intermediate', 'Expert') NOT NULL,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 7. Candidate Education Table
CREATE TABLE candidate_education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    degree VARCHAR(150) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    percentage DECIMAL(5, 2) DEFAULT NULL,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 8. Candidate Experience Table
CREATE TABLE candidate_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    technologies VARCHAR(255) DEFAULT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL, -- Null if currently working
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 9. Candidate Certifications Table
CREATE TABLE candidate_certifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    issue_date DATE DEFAULT NULL,
    url VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 10. Job Alerts Table
CREATE TABLE job_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    keywords VARCHAR(255) DEFAULT NULL,
    location VARCHAR(255) DEFAULT NULL,
    salary DECIMAL(12, 2) DEFAULT NULL,
    job_type VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE
);

-- 11. Saved Jobs Table
CREATE TABLE saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    job_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    CONSTRAINT unique_candidate_saved_job UNIQUE(candidate_id, job_id)
);

-- 12. Job Reviews Table
CREATE TABLE job_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    admin_id INT NOT NULL,
    action ENUM('approve', 'reject') NOT NULL,
    reason TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
