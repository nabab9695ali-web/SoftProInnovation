# 🚀 SoftPro Innovation - Render Deployment Complete Guide (कदम दर कदम गाइड)

Yeh guide aapko SoftPro Innovation project ko **Render.com** par 100% free aur bina kisi error ke live deploy karne ka pura tarika batata hai.

---

## 📌 Deployment se pehle Zaroori Cheezein (Checklist)

1. **GitHub Account**: Code GitHub par push hona chahiye.
2. **MongoDB Atlas Account**: Database connection string (`mongodb+srv://...`).
   > ⚠️ **IMPORTANT**: MongoDB Atlas mein **Network Access** mein jaakar IP Whitelist `0.0.0.0/0` (Allow Access from Anywhere) zaroor enable karein, warna Render ke servers MongoDB se connect nahi kar payenge!
3. **Razorpay Account (Optional)**: Test Mode ke `RAZORPAY_KEY_ID` aur `RAZORPAY_KEY_SECRET`. (Agar nahi hai to COD aur Direct UPI QR code se orders chalenge).

---

## 🛠️ Option A: 1-Click Blueprint Deployment (Sabse Aasan & Recommended)

Hamaare project mein `render.yaml` pehle se configure kar diya gaya hai.

1. [dashboard.render.com](https://dashboard.render.com) par login karein.
2. Top right par **New +** button par click karein aur **Blueprint** select karein.
3. Apna GitHub repository (`SoftProInnovation`) select karein.
4. Render automatically `softpro-backend` aur `softpro-frontend` detect kar lega.
5. Sirf apna `MONGO_URI` enter karein aur **Apply** par click karein.
6. Done! Dono Backend aur Frontend automatically live ho jayenge!

---

## 🛠️ Option B: Manual Setup (Manual Web Service + Static Site)

Agar aap manually deploy karna chahte hain:

### Step 1: Deploy Backend (Web Service)
1. Render Dashboard par **New +** -> **Web Service** par click karein.
2. Apna repository connect karein.
3. Settings enter karein:
   - **Name**: `softpro-backend`
   - **Region**: Singapore ya Oregon
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js` ya `npm start`
   - **Instance Type**: `Free`
4. **Environment Variables** add karein:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://<username>:<password>@cluster0.../ecommerce`
   - `JWT_SECRET` = `aapka_secret_jwt_key_12345`
   - `RAZORPAY_KEY_ID` = `rzp_test_...` *(Optional)*
   - `RAZORPAY_KEY_SECRET` = `aapka_razorpay_secret` *(Optional)*
   - `CLIENT_URL` = `https://softpro-frontend.onrender.com` *(Static site banne ke baad update karein)*
5. **Create Web Service** par click karein.
6. Deploy hone ke baad upar se apna backend URL copy kar lein (e.g. `https://softpro-backend.onrender.com`).

---

### Step 2: Deploy Frontend (Static Site)
1. Render Dashboard par **New +** -> **Static Site** par click karein.
2. Wahi repository select karein.
3. Settings enter karein:
   - **Name**: `softpro-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables** add karein:
   - `VITE_API_URL` = `https://softpro-backend.onrender.com` *(Apna Step 1 wala backend URL dalein)*
5. **Redirects/Rewrites**:
   - `_redirects` file client ke andar pehle se set hai (`/* /index.html 200`), isliye direct page refresh par 404 nahi aayega!
6. **Create Static Site** par click karein.
7. 2-3 minute mein aapki website live ho jayegi!

---

## 🔍 Post-Deployment Verification (Checklist)

Deploy hone ke baad yeh test karein:
- [ ] **Home Page**: Products, deals, categories load ho rahe hain.
- [ ] **Search Bar**: Live search suggestions chal rahe hain.
- [ ] **User Auth**: New user register aur login ho raha hai (passwords bcrypt encrypted hain).
- [ ] **Cart & Checkout**: Product cart mein add ho raha hai, address save ho raha hai.
- [ ] **Payment**: Cash on delivery (COD) aur UPI order create ho raha hai.
- [ ] **Admin Login**: `/admin/login` par login ho raha hai aur Dashboard access ho raha hai.
- [ ] **Page Refresh**: `/products` ya `/cart` par F5 refresh karne par 404 nahi aata.

---

## 💡 Troubleshooting Tips

- **Database Connection Failed**:
  - Check karein MongoDB Atlas ke Network Access mein `0.0.0.0/0` IP added hai ya nahi.
  - Check karein MongoDB password mein special characters (`@`, `#`, etc.) encoded hain ya nahi.
- **Images Not Showing**:
  - Production mein jab naya product add hota hai, Render ka filesystem ephemeral hota hai (restart par local upload files clear ho sakti hain). Permanent images ke liye online image URL (CDN/Cloudinary/Imgur link) ya Render Persistent Disk use karein.
- **Backend Spin-down on Free Tier**:
  - Render free tier par 15 minute inactive rehne par backend sleep mode mein chala jata hai. Pehli request mein 30-40 seconds lag sakte hain. Aap free uptime monitor (jaise UptimeRobot ya Cron-Job.org) se `/api/health` ko har 10 minute mein ping karwa sakte hain.
