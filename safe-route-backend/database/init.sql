-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    emergency_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guardians Table
CREATE TABLE IF NOT EXISTS guardians (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    location GEOMETRY(Point, 4326) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refuges Table (Safe Places)
CREATE TABLE IF NOT EXISTS refuges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Police Station, Hospital, 24/7 Store, etc.
    location GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    operating_hours VARCHAR(100)
);

-- Crime History Table
CREATE TABLE IF NOT EXISTS crime_history (
    id SERIAL PRIMARY KEY,
    location GEOMETRY(Point, 4326) NOT NULL,
    crime_type VARCHAR(100),
    reported_at TIMESTAMP,
    weather_condition VARCHAR(50)
);

-- Checkins Table
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    location GEOMETRY(Point, 4326) NOT NULL,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    path GEOMETRY(LineString, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_reports_location ON reports USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_refuges_location ON refuges USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_crime_history_location ON crime_history USING GIST (location);

-- Populate mock refuges
INSERT INTO refuges (name, type, location, address) VALUES
('Mumbai Central Police Station', 'Police', ST_SetSRID(ST_MakePoint(72.8222, 18.9696), 4326), 'Mumbai Central, Mumbai, Maharashtra'),
('Lilavati Hospital', 'Hospital', ST_SetSRID(ST_MakePoint(72.8285, 19.0505), 4326), 'Bandra West, Mumbai, Maharashtra'),
('Delhi Parliament Street Police', 'Police', ST_SetSRID(ST_MakePoint(77.2117, 28.6256), 4326), 'Parliament Street, New Delhi'),
('AIIMS New Delhi', 'Hospital', ST_SetSRID(ST_MakePoint(77.2078, 28.5672), 4326), 'Ansari Nagar, New Delhi'),
('Cubbon Park Police Station', 'Police', ST_SetSRID(ST_MakePoint(77.5960, 12.9772), 4326), 'Cubbon Park, Bangalore, Karnataka'),
('Apollo Hospitals Bannerghatta', 'Hospital', ST_SetSRID(ST_MakePoint(77.6017, 12.8943), 4326), 'Bannerghatta Road, Bangalore, Karnataka')
ON CONFLICT DO NOTHING;
