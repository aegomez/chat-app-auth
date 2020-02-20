import mongoose from 'mongoose';

/**
 * Connect to the database and retry if connection failed.
 * @param ms Milliseconds between retries (default 5000).
 */
export async function connect(ms = 5000): Promise<void> {
  try {
    const mongoURI = process.env.MONGODB_URI || '';

    await mongoose.connect(mongoURI, {
      auth: {
        user: process.env.MONGODB_USER || '',
        password: process.env.MONGODB_PASS || ''
      },
      authSource: 'admin',
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Succesfully connected to DB.');
  } catch (error) {
    console.error('Could not connect to database.\nRetrying in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, ms));
    return connect(ms);
  }
}

export function disconnect(): Promise<void> {
  return mongoose.disconnect();
}
