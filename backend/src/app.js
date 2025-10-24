const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// Headers HTTP
app.use(helmet());

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { 
    success: false,
    message: 'Demasiadas solicitudes, intente nuevamente más tarde'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Rate limiter estricto 
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20, 
  message: { 
    success: false,
    message: 'Límite de operaciones alcanzado, intente más tarde'
  },
  skipSuccessfulRequests: false
});


// CORS 
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:4200',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logger 
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/', generalLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prueba Practica API',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      health: '/api/health'
    }
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
app.strictLimiter = strictLimiter;

module.exports = app;