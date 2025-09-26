import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './utils/db.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Bear backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
