USE firstjobdb;

-- Insert Users (Password: "Password123!")
-- bcryptjs hash for "Password123!": $2a$10$X1j1T4g6U1Z9n/yV8Q1fA.f7H4mH47Rtfw5U5y/23yW9eZ02c7ZFe
INSERT INTO users (id, email, password_hash, name, role, approval_status, blocked) VALUES
(1, 'admin@firstjob.com', '$2a$10$eFTaAs/nWIiFQklKZjJrpeZiOvPvSlvktlW4wnf3IOnAUDGBkTIG.', 'System Admin', 'admin', 'approved', FALSE),
(2, 'employer1@firstjob.com', '$2a$10$eFTaAs/nWIiFQklKZjJrpeZiOvPvSlvktlW4wnf3IOnAUDGBkTIG.', 'Google Recruiter', 'employer', 'approved', FALSE),
(3, 'employer2@firstjob.com', '$2a$10$eFTaAs/nWIiFQklKZjJrpeZiOvPvSlvktlW4wnf3IOnAUDGBkTIG.', 'Meta HR', 'employer', 'approved', FALSE),
(4, 'john@firstjob.com', '$2a$10$eFTaAs/nWIiFQklKZjJrpeZiOvPvSlvktlW4wnf3IOnAUDGBkTIG.', 'John Doe', 'candidate', 'approved', FALSE),
(5, 'jane@firstjob.com', '$2a$10$eFTaAs/nWIiFQklKZjJrpeZiOvPvSlvktlW4wnf3IOnAUDGBkTIG.', 'Jane Smith', 'candidate', 'pending', FALSE),
(6, 'bob@firstjob.com', '$2a$10$eFTaAs/nWIiFQklKZjJrpeZiOvPvSlvktlW4wnf3IOnAUDGBkTIG.', 'Bob Johnson', 'candidate', 'rejected', FALSE);

-- Insert Employer Profiles
INSERT INTO employers (id, user_id, company_name, logo, website, industry, description) VALUES
(1, 2, 'Google Inc.', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://google.com', 'Technology', 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.'),
(2, 3, 'Meta Platforms Inc.', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg', 'https://meta.com', 'Social Media', 'Meta Platforms, Inc., doing business as Meta and formerly named Facebook, Inc., is an American multinational technology conglomerate.');

-- Insert Candidate Profiles
INSERT INTO candidate_profiles (id, user_id, full_name, headline, about_me, resume_url, expected_salary, notice_period) VALUES
(1, 4, 'John Doe', 'Senior Full Stack Engineer', 'Passionate developer with 5+ years of experience in JavaScript/TypeScript, Node.js, React, and databases.', '/uploads/resumes/john_resume.pdf', 120000.00, 'Immediate'),
(2, 5, 'Jane Smith', 'Graduate Frontend Developer', 'Looking for my first role in React development. Enthusiastic about creating highly responsive visual experiences.', NULL, 65000.00, '30 Days'),
(3, 6, 'Bob Johnson', 'DevOps Specialist', 'Focusing on Kubernetes, Docker, CI/CD, and AWS infrastructure management.', NULL, 95000.00, 'Immediate');

-- Insert Candidate Child Tables (Skills)
INSERT INTO candidate_skills (candidate_id, skill_name, level) VALUES
(1, 'React', 'Expert'),
(1, 'Node.js', 'Expert'),
(1, 'MySQL', 'Intermediate'),
(2, 'HTML/CSS', 'Expert'),
(2, 'React', 'Intermediate'),
(3, 'AWS', 'Expert'),
(3, 'Docker', 'Expert');

-- Insert Candidate Child Tables (Education)
INSERT INTO candidate_education (candidate_id, degree, institution, year, percentage) VALUES
(1, 'B.Tech in Computer Science', 'IIT Delhi', 2020, 85.50),
(2, 'B.Sc in Software Engineering', 'Delhi University', 2024, 78.00);

-- Insert Candidate Child Tables (Experience)
INSERT INTO candidate_experience (candidate_id, company, designation, technologies, start_date, end_date) VALUES
(1, 'Infosys', 'Software Engineer', 'Java, Spring Boot, MySQL', '2020-07-01', '2022-06-30'),
(1, 'TCS', 'Senior Engineer', 'React, Node.js, Express', '2022-07-01', NULL);

-- Insert Candidate Child Tables (Certifications)
INSERT INTO candidate_certifications (candidate_id, name, issue_date, url) VALUES
(1, 'AWS Certified Solutions Architect', '2023-05-15', 'https://aws.amazon.com/certification'),
(3, 'Certified Kubernetes Administrator (CKA)', '2024-01-20', 'https://cncf.io');

-- Insert Jobs
INSERT INTO jobs (id, employer_id, title, description, skills, salary_min, salary_max, experience_min, experience_max, job_type, work_mode, status, vacancies, last_date) VALUES
(1, 1, 'Senior Software Engineer (Full-Stack)', 'Join our Core Search team to build the next generation of search interfaces using React and Node.js. High scale, high performance required.', '["React", "Node.js", "TypeScript", "MySQL"]', 140000.00, 200000.00, 5, 10, 'Full Time', 'Hybrid', 'approved', 3, '2026-09-30'),
(2, 1, 'Product Manager', 'Lead the product lifecycle of Google Cloud Developer tools.', '["Product Strategy", "Cloud Infrastructure", "Agile"]', 120000.00, 170000.00, 3, 7, 'Full Time', 'Onsite', 'pending_approval', 1, '2026-08-15'),
(3, 2, 'Frontend Developer (Intern)', 'Looking for passionate interns who want to work on React Native and core React web products at Meta.', '["React", "JavaScript", "Tailwind CSS"]', 3000.00, 5000.00, 0, 1, 'Internship', 'Remote', 'approved', 5, '2026-08-30'),
(4, 2, 'Database Administrator', 'Optimize and maintain Meta scale MySQL clusters.', '["MySQL", "Database Tuning", "Linux"]', 130000.00, 180000.00, 4, 8, 'Full Time', 'Remote', 'rejected', 2, '2026-07-31');

-- Insert Job Reviews (for the rejected job)
INSERT INTO job_reviews (job_id, admin_id, action, reason) VALUES
(4, 1, 'reject', 'Mismatch in experience criteria and description details.');

-- Insert Applications
INSERT INTO applications (job_id, candidate_id, resume, cover_letter, status) VALUES
(1, 1, '/uploads/resumes/john_resume.pdf', 'I have extensive experience working with React and Node.js. This role aligns perfectly with my background.', 'Applied'),
(3, 1, '/uploads/resumes/john_resume.pdf', 'Looking forward to contribute to Meta React products.', 'Shortlisted');

-- Insert Saved Jobs
INSERT INTO saved_jobs (candidate_id, job_id) VALUES
(1, 3);
