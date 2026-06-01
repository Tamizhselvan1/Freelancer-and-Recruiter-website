-- ==========================================================
-- FREELANCE MARKETPLACE DATABASE SCHEMA (DUMMY CODE)
-- ==========================================================

-- 1. Create Extensions & Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('freelancer', 'client', 'admin');
CREATE TYPE job_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE payment_status AS ENUM ('pending', 'escrow', 'released', 'refunded');

-- 2. Users & Authentication
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Profiles
CREATE TABLE profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url TEXT,
    hourly_rate DECIMAL(10, 2),
    location VARCHAR(100),
    website_url TEXT,
    github_url TEXT,
    skills_json JSONB, -- For quick searching
    rating_avg DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0
);

-- 4. Categories & Skills
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category_id INTEGER REFERENCES categories(category_id)
);

-- 5. Jobs / Projects
CREATE TABLE jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(user_id),
    category_id INTEGER REFERENCES categories(category_id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    is_fixed_price BOOLEAN DEFAULT TRUE,
    complexity_level VARCHAR(20), -- Entry, Intermediate, Expert
    status job_status DEFAULT 'open',
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bids / Proposals
CREATE TABLE bids (
    bid_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES users(user_id),
    bid_amount DECIMAL(12, 2) NOT NULL,
    proposal_text TEXT NOT NULL,
    estimated_days INTEGER,
    status bid_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Contracts & Milestones
CREATE TABLE contracts (
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(job_id),
    freelancer_id UUID REFERENCES users(user_id),
    client_id UUID REFERENCES users(user_id),
    agreed_amount DECIMAL(12, 2) NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active'
);

CREATE TABLE milestones (
    milestone_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(contract_id),
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    payment_status payment_status DEFAULT 'pending'
);

-- 8. Reviews
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(job_id),
    reviewer_id UUID REFERENCES users(user_id),
    reviewee_id UUID REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- DUMMY DATA INSERTION
-- ==========================================================

-- Insert Categories
INSERT INTO categories (name, slug) VALUES 
('Web Development', 'web-dev'),
('Mobile Apps', 'mobile-apps'),
('Graphic Design', 'design'),
('Content Writing', 'writing'),
('Data Science', 'data-science');

-- Insert Skills
INSERT INTO skills (name, category_id) VALUES 
('React', 1), ('Node.js', 1), ('PostgreSQL', 1),
('Flutter', 2), ('Swift', 2),
('Figma', 3), ('Adobe Illustrator', 3),
('SEO Writing', 4), ('Technical Writing', 4),
('Python', 5), ('TensorFlow', 5);

-- Insert Dummy Users (Passwords are 'password123' hashes)
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('John Doe', 'john@client.com', '$2b$10$Exv...', 'client'),
('Jane Smith', 'jane@freelance.com', '$2b$10$Exv...', 'freelancer'),
('Bob Wilson', 'bob@freelance.com', '$2b$10$Exv...', 'freelancer'),
('Alice Brown', 'alice@client.com', '$2b$10$Exv...', 'client');

-- Sample Job Posting
INSERT INTO jobs (client_id, category_id, title, description, budget_min, budget_max, status)
SELECT 
    user_id, 
    1, 
    'Build a Full-Stack E-commerce Site', 
    'We need a React + Node.js expert to build a high-performance marketplace.', 
    2000.00, 5000.00, 
    'open'
FROM users WHERE email = 'john@client.com' LIMIT 1;

-- Sample Bid
INSERT INTO bids (job_id, freelancer_id, bid_amount, proposal_text, estimated_days)
SELECT 
    j.job_id, 
    u.user_id, 
    3500.00, 
    'I have 5 years of experience in React and have built 10+ e-commerce sites.', 
    30
FROM jobs j, users u 
WHERE j.title = 'Build a Full-Stack E-commerce Site' AND u.email = 'jane@freelance.com' LIMIT 1;

-- ==========================================================
-- HELPER VIEWS
-- ==========================================================

-- View to see active job listings with client names
CREATE VIEW active_job_listings AS
SELECT 
    j.job_id,
    j.title,
    c.name as category_name,
    u.full_name as client_name,
    j.budget_min,
    j.budget_max,
    j.created_at,
    (SELECT COUNT(*) FROM bids b WHERE b.job_id = j.job_id) as total_bids
FROM jobs j
JOIN categories c ON j.category_id = c.category_id
JOIN users u ON j.client_id = u.user_id
WHERE j.status = 'open'
ORDER BY j.created_at DESC;

-- Complex Query: Find top rated freelancers in a specific skill
-- SELECT p.full_name, p.rating_avg, p.hourly_rate
-- FROM profiles p
-- WHERE p.skills_json ? 'React'
-- ORDER BY p.rating_avg DESC, p.total_reviews DESC;