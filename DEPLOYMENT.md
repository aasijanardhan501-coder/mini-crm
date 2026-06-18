# Production Deployment Guide: Mini CRM

This guide outlines the step-by-step procedure to deploy the Mini CRM backend to **Render** and the frontend to **Vercel**, using **MongoDB Atlas** as the database.

---

## Step 1: MongoDB Atlas Production Setup

1. **Sign Up / Log In**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an account.
2. **Create a Database Cluster**:
   - Select **M0 Free Tier** (Shared RAM, Shared CPU).
   - Choose your provider (AWS/GCP/Azure) and select a region close to your target audience.
   - Click **Create**.
3. **Configure Database Security**:
   - **Database Access**: Create a database user (e.g. `crm-admin`) with a secure password. Select **Read and write to any database** role.
   - **Network Access**: Add an IP access rule. For testing, you can add `0.0.0.0/0` (Access from anywhere). In production, you can restrict this to the static outbound IP of your Render service.
4. **Get Connection String**:
   - In the Database view, click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     `mongodb+srv://crm-admin:<password>@cluster0.xxxxx.mongodb.net/mini-crm?retryWrites=true&w=majority`
   - Keep this string ready for the backend configurations.

---

## Step 2: Deploy Backend on Render

Render is a modern cloud hosting platform perfect for hosting Express APIs.

1. **Initialize Git Repository**:
   Initialize git at the root of the project to allow Render to read from your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production"
   ```
2. **Push to GitHub**: Create a repository on GitHub (public or private) and push your code there.
3. **Log In to Render**: Visit [Render](https://render.com/) and connect your GitHub account.
4. **Create Web Service**:
   - Click **New +** and select **Web Service**.
   - Select your MERN repository from the GitHub connections list.
5. **Configure Build Settings**:
   - **Name**: `mini-crm-api`
   - **Environment**: `Node`
   - **Region**: Choose the region closest to your database cluster.
   - **Branch**: `main` (or whichever branch you pushed).
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Set Environment Variables**:
   Click **Advanced** and add the following keys:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render binds the port automatically, but setting this is a safe practice)
   - `MONGO_URI` = `mongodb+srv://crm-admin:<password>@cluster0.xxxxx.mongodb.net/mini-crm?retryWrites=true&w=majority`
   - `JWT_SECRET` = `choose_a_long_random_secure_string`
   - `JWT_EXPIRE` = `30d`
   - `CLIENT_URL` = `https://your-frontend-app.vercel.app` (You can update this after Vercel deployment)
7. **Deploy**: Click **Create Web Service**. Wait for the logs to say `Server running in production mode on port 10000` and `MongoDB Connected`.
8. **Copy API URL**: Copy the Render service URL (e.g., `https://mini-crm-api.onrender.com`).

---

## Step 3: Deploy Frontend on Vercel

Vercel is the optimal hosting platform for Vite-built static sites.

1. **Log In to Vercel**: Visit [Vercel](https://vercel.com/) and connect your GitHub account.
2. **Import Project**:
   - Click **Add New** and select **Project**.
   - Select your MERN repository.
3. **Configure Project Settings**:
   - **Project Name**: `mini-crm`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Configure Environment Variables**:
   Add the following environment variable:
   - `VITE_API_URL` = `https://mini-crm-api.onrender.com/api` (Replace with your actual Render API URL)
5. **Deploy**: Click **Deploy**. Vercel will compile the frontend and assign a live production domain (e.g., `https://mini-crm.vercel.app`).
6. **Final Update**: Go back to Render, click **Environment** in your Web Service dashboard, and update `CLIENT_URL` to match the newly generated Vercel domain. This enforces strict CORS protection.

---

## Step 4: Verification Check

Once both hostings are live:
1. Visit the Vercel URL.
2. Attempt to register/login using the console.
3. Verify that the browser localStorage saves the session token.
4. Add a lead, update a status, and write a follow-up note.
5. Check if the dashboard overview metric boxes update in real-time.
