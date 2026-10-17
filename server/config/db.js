import mongoose from 'mongoose';

export const connectDB = async () => {
  let uri = process.env.MONGODB_URI?.trim();

  // Strip surrounding quotes if the user added them in environment variables
  if (uri && ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'")))) {
    uri = uri.slice(1, -1).trim();
  }

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set. Falling back to local mongodb://127.0.0.1:27017/hajar_db');
    uri = 'mongodb://127.0.0.1:27017/hajar_db';
  }

  // Check if user left angle brackets <password>
  if (uri.includes('<') || uri.includes('>')) {
    console.error('❌ MONGODB_URI contains angle brackets ("<" or ">"). Make sure to replace <password> with your actual password without the brackets!');
  }

  try {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`Connecting to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      console.error('\n🔑 AUTHENTICATION TROUBLESHOOTING GUIDE:');
      console.error('1. Check MongoDB Atlas -> Database Access: ensure the username and password match exactly.');
      console.error('2. Remove any angle brackets: use "...:mypassword@..." NOT "...:<mypassword>@...".');
      console.error('3. If your password has special characters like @, #, $, %, &, encode them or use letters & numbers only.');
      console.error('4. Check MongoDB Atlas -> Network Access: add IP 0.0.0.0/0 (Allow access from anywhere) so Render can connect.\n');
    }
    process.exit(1);
  }
};
