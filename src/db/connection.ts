import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || '';

export const connect = async (): Promise<void> => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect();
};
