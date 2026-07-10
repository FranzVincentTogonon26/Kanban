import dotenv from "dotenv";
dotenv.config({ quiet: true });

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES,
  GIMINI_API_KEY: process.env.GIMINI_API_KEY,
  GIMINI_MODEL: process.env.GIMINI_MODEL,
};
