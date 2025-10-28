const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');

// GET /api/patients
router.get('/', patientController.getAllPatients);

// GET /api/patients/:id
router.get('/:id', patientController.getPatientById);

// POST /api/patients
router.post('/', patientController.createPatient);

// PUT /api/patients/:id
router.put('/:id', patientController.updatePatient);

// DELETE /api/patients/:id
router.delete('/:id', patientController.deletePatient);

module.exports = router;