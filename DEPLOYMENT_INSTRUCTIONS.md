# TailorConnect - Deployment Guide (முழுமையான வழிகாட்டி)

இந்த Project ஒரு **MERN Stack** (React + Node.js Express + MongoDB) Application. 
இதை வெற்றிகரமாக live-ல் deploy செய்ய 3 முக்கிய படிகள் உள்ளன:

1. **Database:** MongoDB Atlas (இலவச Cloud Database)
2. **Backend API:** Render.com (இலவச Node.js Express Server)
3. **Frontend Web App:** Vercel (இலவச React Hosting)

---

## 📌 Step 1: MongoDB Atlas Database உருவாக்குதல் (Free)
Cloud-ல் data சேமிக்க MongoDB Atlas தேவை:

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) சென்று **Sign Up / Login** செய்யவும்.
2. **Create a Deployment** -> **M0 (Free)** கிளஸ்டரைத் தேர்வு செய்யவும்.
3. **Security Quickstart**:
   - **Username** மற்றும் **Password** உருவாக்கவும் (எ.கா: `admin` / உங்கள் பாஸ்வேர்ட்). இதை குறித்து வைத்துக்கொள்ளுங்கள்!
   - **IP Access List**: `0.0.0.0/0` (Allow Access from Anywhere) சேர்க்கவும்.
4. **Connect** கிளிக் செய்து -> **Drivers** (Node.js) தேர்வு செய்யவும்.
5. கிடைக்கும் Connection String இப்படி இருக்கும்:
   ```env
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/tailorconnect?retryWrites=true&w=majority
   ```
   *(இதில் `<password>` இடத்தில் உங்கள் உண்மையான பாஸ்வேர்டை போடவும்).*

---

## 📌 Step 2: Backend-ஐ Render.com-ல் Deploy செய்தல் (Free)

1. [render.com](https://render.com) சென்று GitHub கணக்கு மூலம் **Login** செய்யவும்.
2. **New +** பட்டனை கிளிக் செய்து -> **Web Service** தேர்ந்தெடுக்கவும்.
3. உங்கள் GitHub Repository `magesh-2007/TailorConnect-deploy` என்பதை **Connect** செய்யவும்.
4. கீழ்கண்டவாறு Settings நிரப்பவும்:
   - **Name:** `tailorconnect-backend`
   - **Region:** Singapore (அல்லது Frankfurt)
   - **Root Directory:** `backend`  ⚠️ *(மிக முக்கியம்)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. **Environment Variables** பகுதியில் Add Environment Variable கிளிக் செய்து இவற்றை சேர்க்கவும்:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = `super_secret_tailorconnect_jwt_key_2026_production_grade`
   - `JWT_EXPIRES_IN` = `7d`
   - `MONGODB_URI` = *(Step 1-ல் பெற்ற உங்கள் MongoDB Atlas URL)*
   - `CLIENT_URL` = `https://<உங்கள்-vercel-app-url>.vercel.app` (அல்லது `*`)
   - `GEMINI_API_KEY` = `your_gemini_api_key_here` (Optional)
6. **Deploy Web Service** கிளிக் செய்யவும்.
7. 2-3 நிமிடங்களில் Backend Deploy ஆகி ஒரு URL கிடைக்கும் (எ.கா: `https://tailorconnect-backend.onrender.com`).
   - இந்த URL-ஐ குறித்துக் கொள்ளுங்கள்!

---

## 📌 Step 3: Frontend-ஐ Vercel-ல் Deploy செய்தல் (Free)

1. [vercel.com](https://vercel.com) சென்று GitHub மூலம் **Login** செய்யவும்.
2. **Add New...** -> **Project** கிளிக் செய்து `TailorConnect-deploy` repo-வை **Import** செய்யவும்.
3. Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (Default)
   - **Build Command:** `npm --prefix frontend/tailorconnect-frontend install && npm --prefix frontend/tailorconnect-frontend run build` (தானாகவே vercel.json-ல் இருந்து எடுத்துக்கொள்ளும்)
   - **Output Directory:** `frontend/tailorconnect-frontend/dist`
4. **Environment Variables** பிரிவை விரித்து இதை சேர்க்கவும்:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://tailorconnect-backend.onrender.com/api`  *(Step 2-ல் கிடைத்த Render Backend URL உடன் `/api` சேர்க்க வேண்டும்)*
   - **Key:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `70129355960-akrov4hc7cmk8qu3mfj1rkehmf11dcbh.apps.googleusercontent.com`
5. **Deploy** பட்டனை அழுத்தவும்!

---

## 🚀 அனைத்தும் தயார்!
Vercel கொடுத்த Live URL-ஐ ஓபன் செய்து:
1. Customer / Tailor / Student / Admin கணக்கு Login / Register செய்து பார்க்கவும்.
2. Backend Render உடன் வெற்றிகரமாக தொடர்பு கொண்டு Live-ல் வேலை செய்யும்!
