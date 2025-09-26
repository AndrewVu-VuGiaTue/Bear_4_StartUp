# Bear Backend (Node.js + Express + MongoDB)

All app text is in English. This backend provides authentication APIs: sign up (sends OTP), verify OTP, and sign in.

## Quick Start

1. Install dependencies
```
npm install
```

2. Create a `.env` file based on `.env.example` and set your values.

3. Run the server
```
npm run dev
```
The server runs on http://localhost:4000 by default.

## Environment
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Any long random string
- SMTP variables: If not provided, the server logs OTP codes to the console for development

## API Endpoints
- `POST /api/auth/signup`
- `POST /api/auth/verify-otp`
- `POST /api/auth/signin`
