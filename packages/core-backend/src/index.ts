import dotenv from 'dotenv';
import path from 'path';

// Load environment variables dynamically allowing overrides from the monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 ERP Core Backend is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start ERP Core Backend:', error);
    process.exit(1);
  }
};

startServer();
