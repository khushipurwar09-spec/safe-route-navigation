-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Guardians Table
CREATE TABLE IF NOT EXISTS guardians (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, 
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refuges Table (Safe Havens)
CREATE TABLE IF NOT EXISTS refuges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    phone VARCHAR(20)
);

-- Checkins Table
CREATE TABLE IF NOT EXISTS checkins (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Populate mock refuges
INSERT INTO refuges (name, type, location, address) VALUES
('Central Police Station', 'Police', ST_SetSRID(ST_MakePoint(72.8222, 18.9696), 4326), 'Mumbai Central, Mumbai'),
('Lilavati Hospital', 'Hospital', ST_SetSRID(ST_MakePoint(72.8285, 19.0505), 4326), 'Bandra West, Mumbai'),
('Delhi Parliament Street Police', 'Police', ST_SetSRID(ST_MakePoint(77.2117, 28.6256), 4326), 'Parliament Street, New Delhi'),
('AIIMS New Delhi', 'Hospital', ST_SetSRID(ST_MakePoint(77.2078, 28.5672), 4326), 'Ansari Nagar, New Delhi')
ON CONFLICT DO NOTHING;
