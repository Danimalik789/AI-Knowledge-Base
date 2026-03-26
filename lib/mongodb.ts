import mongoose from 'mongoose';

// Look here: We don't read the .env here anymore!

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  // Read it dynamically inside the function!
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}
