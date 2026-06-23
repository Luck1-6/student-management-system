-- =====================================================
-- SMS AUTH MODULE SEED DATA
-- Database: PostgreSQL
-- Password for all users: Password@123
-- =====================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users_customuser (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK(role IN ('student','staff','admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    profile_picture VARCHAR(255),
    phone_number VARCHAR(20),
    password VARCHAR(128) NOT NULL
);

-- =====================================================
-- ADMIN USER
-- =====================================================

INSERT INTO users_customuser
(email, username, first_name, last_name, role,
 is_active, is_staff, is_superuser,
 phone_number, password)
VALUES
(
'admin@sms.edu',
'admin',
'System',
'Administrator',
'admin',
TRUE,
TRUE,
TRUE,
'9999999999',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
);

-- =====================================================
-- STAFF USERS
-- =====================================================

INSERT INTO users_customuser
(email, username, first_name, last_name, role,
 is_active, is_staff, is_superuser,
 phone_number, password)
VALUES

(
'staff1@sms.edu',
'staff1',
'Rahul',
'Sharma',
'staff',
TRUE,
TRUE,
FALSE,
'9000000001',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
),

(
'staff2@sms.edu',
'staff2',
'Priya',
'Singh',
'staff',
TRUE,
TRUE,
FALSE,
'9000000002',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
),

(
'staff3@sms.edu',
'staff3',
'Amit',
'Kumar',
'staff',
TRUE,
TRUE,
FALSE,
'9000000003',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
);

-- =====================================================
-- STUDENTS
-- =====================================================

INSERT INTO users_customuser
(email, username, first_name, last_name, role,
 is_active, is_staff, is_superuser,
 phone_number, password)
VALUES

(
'student1@sms.edu',
'student1',
'Mayank',
'Singh',
'student',
TRUE,
FALSE,
FALSE,
'8000000001',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
),

(
'student2@sms.edu',
'student2',
'Rohit',
'Patel',
'student',
TRUE,
FALSE,
FALSE,
'8000000002',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
),

(
'student3@sms.edu',
'student3',
'Anjali',
'Verma',
'student',
TRUE,
FALSE,
FALSE,
'8000000003',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
),

(
'student4@sms.edu',
'student4',
'Neha',
'Gupta',
'student',
TRUE,
FALSE,
FALSE,
'8000000004',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
),

(
'student5@sms.edu',
'student5',
'Vikas',
'Yadav',
'student',
TRUE,
FALSE,
FALSE,
'8000000005',
'pbkdf2_sha256$720000$demo$0hT2N8oM9kA5uY1xFqQ8N1dXh3Xk2zM6J8rQ5dL7eWQ='
);

-- =====================================================
-- VERIFY DATA
-- =====================================================

SELECT id,
       username,
       email,
       role,
       is_staff,
       is_superuser
FROM users_customuser
ORDER BY role, username;