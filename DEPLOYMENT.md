# Deployment Guide: Dungeon Architect

This document provides instructions for deploying the Dungeon Architect application.

## Architecture Highlights
- **Frontend**: React (Vite) deployed to **Vercel**.
- **Backend**: Node.js (Express + Socket.io) deployed to **Render**.
- **Database**: MongoDB Atlas.

---

## 1. Prerequisites
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
- A [GitHub](https://github.com/) repository containing the project.
- Accounts on [Vercel](https://vercel.com/) and [Render](https://render.com/).

---

## 2. Backend Deployment (Render)

Render is recommended for the backend because it supports persistent WebSocket connections better than serverless platforms.

### Steps:
1. Log in to **Render** and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `dungeon-architect-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   Add the following variables in the "Env Vars" section:
   - `PORT`: `10000` (Render's default)
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long, random string.
   - `NODE_ENV`: `production`
5. Click **Create Web Service**.

---

## 3. Frontend Deployment (Vercel)

Vercel is optimized for Vite/React applications.

### Steps:
1. Log in to **Vercel** and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
4. **Environment Variables**:
   Vercel needs to know where the backend is located to handle proxying or direct API calls.
   - `VITE_API_BASE_URL`: (Optional if using proxy, but recommended) The URL of your Render service (e.g., `https://dungeon-architect-server.onrender.com`).
5. **Vercel Proxy Configuration**:
   Create a `vercel.json` file in the `client` directory (or root if configured) to route API calls to the Render backend:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://your-render-url.onrender.com/api/:path*" },
       { "source": "/socket.io/:path*", "destination": "https://your-render-url.onrender.com/socket.io/:path*" }
     ]
   }
   ```
6. Click **Deploy**.

---

## 4. Troubleshooting

### Socket.io Connection Issues
- Ensure CORS is configured in `server/src/index.ts` to allow your Vercel domain.
- If using Vercel, the `vercel.json` rewrites are critical for both `/api` and `/socket.io`.

### MongoDB Connection
- Ensure your MongoDB Atlas cluster has "Allow Access from Anywhere" (0.0.0.0/0) enabled, or add Render's outbound IP addresses.
