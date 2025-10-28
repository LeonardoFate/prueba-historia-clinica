const express = require('express');
const router = express.Router();
const patientRoutes = require('./patient.routes');
const authRoutes = require('./auth.routes');
const epagoRoutes = require('./epago.routes');

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de pacientes
router.use('/patients', patientRoutes);

// Rutas de transacciones Epago
router.use('/epago', epagoRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      epago: '/api/epago'
    }
  });
});

module.exports = router;