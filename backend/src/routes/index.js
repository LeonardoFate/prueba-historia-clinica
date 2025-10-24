const express = require('express');
const router = express.Router();
const patientRoutes = require('./patient.routes');

// Rutas de pacientes
router.use('/patients', patientRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;