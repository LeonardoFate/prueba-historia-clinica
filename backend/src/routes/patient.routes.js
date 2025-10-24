const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

// Obtener todos los pacientes
router.get('/', patientController.getAllPatients);

// Obtener un paciente específico
router.get('/:id', patientController.getPatientById);

// Crear un nuevo paciente
router.post('/', patientController.createPatient);

// Actualizar un paciente
router.put('/:id', patientController.updatePatient);

// Eliminar un paciente
router.delete('/:id', patientController.deletePatient);

module.exports = router;