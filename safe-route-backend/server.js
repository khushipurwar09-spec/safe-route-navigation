require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Redis Connection
let redisConnected = false;
const redisClient = redis.createClient({ 
  url: process.env.REDIS_URL,
  socket: { reconnectStrategy: false } // Disable auto-reconnect to avoid spamming if no local redis exists
});
redisClient.on('error', err => {
  if (redisConnected) console.log('Redis Client Error', err.message);
});
redisClient.on('ready', () => { redisConnected = true; console.log('Redis Connected'); });
redisClient.connect().catch(() => console.log('Starting without Redis (set REDIS_URL to enable)'));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

app.get('/', (req, res) => res.send('Safe Route Backend Running'));

// Auth Routes (Mocked for simplicity)
app.post('/api/auth/register', async (req, res) => {
    // Basic mock registration
    res.json({ token: jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'dev_secret') });
});

// FEATURE 1 - Fastest Route
app.post('/api/route/shortest', async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.body;
  // Integrate with a routing engine like OSRM or Mapbox. Returning mock.
  res.json({ route: [], estimatedTime: 15 });
});

// FEATURE 2 - Street Light Router (weather-aware)
app.post('/api/route/lit-street', async (req, res) => {
  const { startLat, startLng, endLat, endLng, weather } = req.body;
  // Calculate safe route considering lights and weather
  res.json({ route: [], isWellLit: true, weatherAdjusted: true });
});

// FEATURE 3 - Reporting
app.post('/api/report', authenticateToken, async (req, res) => {
  const { lat, lng, type, description } = req.body;
  try {
    await pool.query(
      'INSERT INTO reports (user_id, location, type, description) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5)',
      [req.user.id, lng, lat, type, description]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/reports', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT type, description, ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat FROM reports ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FEATURE 5 - Safe Refuges
app.get('/api/refuges/nearby', async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;
  try {
    const { rows } = await pool.query(
      `SELECT name, type, address, phone, ST_X(location::geometry) as lng, ST_Y(location::geometry) as lat, 
       ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
       FROM refuges 
       WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
       ORDER BY distance LIMIT 20`,
      [lng, lat, radius]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FEATURE 6 - Real-time Conditions
app.get('/api/conditions', async (req, res) => {
  res.json({ safe: true, activeUsers: 150, alerts: [] });
});

// FEATURE 7 - Sound Alert
app.post('/api/audio/analyze', authenticateToken, async (req, res) => {
  // Mock audio analysis for screams or breaking glass
  res.json({ threatLevel: 'low', detected: null });
});

// FEATURE 8 - Fake Call
app.post('/api/fake-call', authenticateToken, (req, res) => {
  // Trigger logic for fake call (e.g., send SMS via Twilio if using that, or just signal app)
  res.json({ success: true, message: 'Fake call triggered on device' });
});

// FEATURE 9 - Thumb Buttons (Emergency, Checkin, Reroute)
app.post('/api/emergency', authenticateToken, async (req, res) => {
  const { lat, lng } = req.body;
  // Trigger SOS logic, notify emergency contacts, log to DB
  io.emit('emergency-alert', { userId: req.user.id, lat, lng });
  res.json({ success: true, message: 'Emergency contacts notified' });
});

app.post('/api/checkin', authenticateToken, async (req, res) => {
  const { lat, lng } = req.body;
  try {
    await pool.query(
      'INSERT INTO checkins (user_id, location) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))',
      [req.user.id, lng, lat]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reroute', authenticateToken, async (req, res) => {
    // Generate an immediate new route
    res.json({ route: [], status: 'rerouted safely' });
});

// FEATURE 10 - Health Mode (Toggle API if needed, otherwise handled on client)
app.post('/api/health-mode', authenticateToken, (req, res) => {
  res.json({ mode: 'health', active: true });
});

// FEATURE 11 - Crime Prediction
app.post('/api/crime/predict', async (req, res) => {
  const { lat, lng, time, weather } = req.body;
  // Mock AI ML prediction based on history, time, and weather
  res.json({ riskScore: 25, recommendation: 'Safe to proceed, stay on main roads' });
});

// FEATURE 12 - Watch Integration
app.post('/api/watch/sync', authenticateToken, (req, res) => {
  const { heartRate, movement } = req.body;
  if (heartRate > 120 && movement === 'running') {
      // Possible distress
      io.to(req.user.id).emit('check-status');
  }
  res.json({ synced: true });
});

// FEATURE 4 - Behavior Check (WebSocket)
io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('authenticate', (token) => {
      // Validate token and attach user to socket
      jwt.verify(token, process.env.JWT_SECRET || 'dev_secret', (err, user) => {
          if(!err) {
              socket.user = user;
              socket.join(user.id);
          }
      });
  });

  socket.on('location-update', async (data) => {
    if (!socket.user) return;
    const { lat, lng, expectedRoute } = data;
    
    // Store latest location in Redis for quick access
    if (redisConnected) {
        await redisClient.setEx(`user-loc:${socket.user.id}`, 300, JSON.stringify({ lat, lng })).catch(e => console.log('Redis error:', e.message));
    }

    // Deviation detection logic (mocked)
    // If expectedRoute exists, check distance to expected polyline
    const deviationDistance = 0; // Mock calculation
    if (deviationDistance > 50) {
        socket.emit('deviation-alert', { message: 'You have deviated from the safe route.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
