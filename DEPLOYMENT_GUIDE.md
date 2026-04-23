# Women Safety Navigation System - Free Deployment Guide

This guide explains how to deploy the entire stack using free tiers.

## Step 1: Supabase Database (FREE)
1. Sign up at [supabase.com](https://supabase.com)
2. Create project (Select a region close to your users, e.g., Mumbai)
3. Go to SQL Editor and run the contents of `backend/database/init.sql`
4. Go to Project Settings -> Database -> Copy the Connection String (URI). Replace `[YOUR-PASSWORD]` with your database password. This is your `DATABASE_URL`.

## Step 2: Upstash Redis (FREE)
1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Scroll down and copy the Node.js connection string. This is your `REDIS_URL`.

## Step 3: Render Backend (FREE)
1. Push your backend code (`safe-route-backend`) to a GitHub repository.
2. Sign up at [render.com](https://render.com)
3. Click "New" -> "Web Service" -> Connect your GitHub repository.
4. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
5. Add Environment Variables:
   - `DATABASE_URL` (From Supabase)
   - `REDIS_URL` (From Upstash)
   - `JWT_SECRET` (Create a random secret string)
6. Click Deploy. Once deployed, you will get a URL like `https://safe-route-backend.onrender.com`.

## Step 4: Frontend Configuration
1. Open `safe-route-app/services/api.js` and update `API_URL` to your Render URL: `https://safe-route-backend.onrender.com/api`
2. Open `safe-route-app/services/websocket.js` and update `SOCKET_URL` to your Render URL: `https://safe-route-backend.onrender.com`

## Step 5: Run App Locally
1. Navigate to frontend folder: `cd safe-route-app`
2. Install dependencies: `npm install`
3. Start Expo: `npx expo start`
4. Scan the QR code with the Expo Go app on your phone.

## Step 6: Build APK for Android (FREE)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login to Expo: `eas login`
3. Configure build: `eas build:configure`
4. Build APK: `eas build -p android --profile preview`
5. Download the provided APK link and share it!
