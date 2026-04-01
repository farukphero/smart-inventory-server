import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from "./app/config";


let server: Server;

async function main() {
  try {
    // await mongoose.connect(config.database_url as string);

    const uri = 'mongodb+srv://development:wTQbXzBb6ll8SglD@development.e2yft8e.mongodb.net/smart-inventory';

    // ✅ Prevent undefined MongoDB URI crash
    if (!uri) {
      throw new Error('❌ DATABASE_URL is not defined in environment variables');
    }

    // ✅ Connect MongoDB safely
    await mongoose.connect(uri);

    server = app.listen(config.port, () => {
      console.log(`smart-inventory system is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', () => {
  console.log(`😈 unhandledRejection is detected , shutting down ...`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
