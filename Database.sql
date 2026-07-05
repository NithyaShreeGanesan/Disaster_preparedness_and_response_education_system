-- Step 1: Create Database
CREATE DATABASE disaster_preparedness;
USE disaster_preparedness;

-- Step 2: Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Disaster Types
CREATE TABLE disaster_types (
    disaster_id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Step 4: Educational Content
CREATE TABLE education_content (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'video', 'pdf') NOT NULL,
    FOREIGN KEY (disaster_id) REFERENCES disaster_types(disaster_id)
);

-- Step 5: Emergency Guidelines
CREATE TABLE emergency_guidelines (
    guideline_id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT,
    guideline TEXT NOT NULL,
    FOREIGN KEY (disaster_id) REFERENCES disaster_types(disaster_id)
);

-- Step 6: Alerts
CREATE TABLE alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT,
    message TEXT NOT NULL,
    alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (disaster_id) REFERENCES disaster_types(disaster_id)
);

-- Step 7: Evacuation Plans
CREATE TABLE evacuation_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    instructions TEXT NOT NULL,
    safe_zone VARCHAR(100)
);

-- Step 8: Quizzes
CREATE TABLE quizzes (
    quiz_id INT AUTO_INCREMENT PRIMARY KEY,
    disaster_id INT,
    question TEXT NOT NULL,
    option_a VARCHAR(100),
    option_b VARCHAR(100),
    option_c VARCHAR(100),
    option_d VARCHAR(100),
    correct_option CHAR(1),
    FOREIGN KEY (disaster_id) REFERENCES disaster_types(disaster_id)
);

-- Step 9: Quiz Results
CREATE TABLE quiz_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    quiz_id INT,
    score INT,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);
