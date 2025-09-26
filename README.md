# Bear Startup Monorepo

This repository contains two folders:

- `backend/`: Node.js + Express + MongoDB API for authentication (sign up with OTP, verify, sign in)
- `frontend/`: Expo React Native app with a soft pink theme and screens in English

## Getting Started

### Backend
- Go to `backend/`
- Copy `.env.example` to `.env` and fill in values
- Install dependencies: `npm install`
- Start dev server: `npm run dev`

### Frontend
- Go to `frontend/`
- Install dependencies: `npm install`
- Start Expo: `npx expo start`
- Launch Android from Expo dev tools

Notes:
- OTP emails will be logged to console if SMTP is not configured.
- Default API base URL in the app is `http://10.0.2.2:4000` for Android emulator.
