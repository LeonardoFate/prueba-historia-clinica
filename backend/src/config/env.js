require('dotenv').config();


function validateEnv() {
  const required = [
    'DB_USER',
    'DB_PASSWORD',
    'DB_CONNECTION_STRING',
    'PORT'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { validateEnv };