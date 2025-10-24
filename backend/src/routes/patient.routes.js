const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

const rateLimit = require('express-rate-limit');

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { 
    success: false,
    message: 'Límite de operaciones alcanzado, intente más tarde'
  },
  skipSuccessfulRequests: false
});

// Obtener todos los pacientes
router.get('/', patientController.getAllPatients);

// Obtener un paciente específico
router.get('/:id', patientController.getPatientById);

// Crear un nuevo paciente
router.post('/', strictLimiter, patientController.createPatient);

// Actualizar un paciente
router.put('/:id', strictLimiter, patientController.updatePatient);

// Eliminar un paciente
router.delete('/:id', strictLimiter, patientController.deletePatient);

module.exports = router;