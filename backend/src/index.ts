import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`🩺 National Medical System API is active`);
});
