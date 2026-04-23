# Women Safety Navigation System

A complete, production-ready full-stack application built for personal safety. Features real-time tracking, safe routing, emergency SOS, health disguise mode, and crime prediction based on location and weather.

## Features List
1. Fastest Route 
2. Street Light Router (weather-aware)
3. Incident Reporting
4. Behavior Check (WebSocket deviation detection)
5. Safe Refuges Locator
6. Real-time Conditions
7. Sound Alert Analysis
8. Fake Call Simulation
9. Thumb Buttons (SOS, Checkin, Reroute)
10. Health Mode (Disguise App)
11. Crime Prediction Model API
12. Watch Integration Sync API

## Tech Stack
- **Backend:** Node.js, Express, PostgreSQL + PostGIS, Redis, Socket.io
- **Frontend:** React Native, Expo, MapView
- **Deployment:** Render (Backend), Supabase (DB), Upstash (Redis), Expo (App)

## Setup Instructions

### 1. Backend Setup
1. `cd safe-route-backend`
2. `npm install`
3. Copy `.env.example` to `.env` and fill in credentials.
4. Set up your PostgreSQL database and run `database/init.sql` to initialize schema.
5. `npm run dev` to start server.

### 2. Frontend Setup
1. `cd safe-route-app`
2. `npm install`
3. Update API endpoints in `services/api.js` and `services/websocket.js` if running on device.
4. `npx expo start`

### Deployment
Read `DEPLOYMENT_GUIDE.md` for a comprehensive step-by-step free deployment tutorial.
