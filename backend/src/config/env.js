const path = require('path');
const fs = require('fs');

class EnvConfig {
  constructor() {
    this.loaded = false;
  }

  load() {
    if (this.loaded) {
      return; 
    }

    const env = process.env.NODE_ENV || 'development';
    const envFile = env === 'test' ? '.env.test' : '.env';
    const envPath = path.resolve(process.cwd(), envFile);

    if (!fs.existsSync(envPath)) {
      console.warn(`Warning: ${envFile} not found at ${envPath}`);
      
      // cargar .env como fallback
      if (env === 'test') {
        const fallbackPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(fallbackPath)) {
          require('dotenv').config({ path: fallbackPath });
          console.log('Loaded .env as fallback for tests');
        }
      }
    } else {
      require('dotenv').config({ path: envPath });
      
      if (env !== 'test') {
        console.log(`Loaded environment from ${envFile}`);
      }
    }

    this.loaded = true;
  }

  validate() {
    const required = [
      'DB_USER',
      'DB_PASSWORD',
      'DB_CONNECTION_STRING',
      'PORT'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        `Please check your .env file.`
      );
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log('✓ Environment variables validated');
    }
  }

  get(key, defaultValue = undefined) {
    return process.env[key] || defaultValue;
  }

  getNumber(key, defaultValue = 0) {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  getBoolean(key, defaultValue = false) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }
}

const envConfig = new EnvConfig();
envConfig.load();

function validateEnv() {
  envConfig.validate();
}

module.exports = {
  validateEnv,
  env: envConfig
};