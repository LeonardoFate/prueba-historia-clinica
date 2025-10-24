const patientService = require('../services/patient.service');
const { validatePatientData } = require('../utils/validators');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/responses');

// /api/patients
async function getAllPatients(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
  
    if (page < 1) {
      return errorResponse(res, 'La página debe ser mayor que 0', 400);
    }
    
    if (limit < 1 || limit > 100) {
      return errorResponse(res, 'El límite debe estar entre 1 y 100', 400);
    }
    
    const result = await patientService.getAllPatients(page, limit, search);
    
    return successResponse(res, result, 'Pacientes obtenidos exitosamente');
  } catch (error) {
    console.error('ERROR en el controlador obtenerTodosLosPacientes:', error);
    return errorResponse(res, 'Error al obtener los pacientes', 500);
  }
}

// /api/patients/:id
async function getPatientById(req, res) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
      return errorResponse(res, 'id del paciente no valido', 400);
    }
    
    const patient = await patientService.getPatientById(id);
    
    if (!patient) {
      return notFoundResponse(res, 'No se encontro al paciente');
    }
    
    return successResponse(res, patient, 'Paciente obtenido exitosamente');
  } catch (error) {
    console.error('ERROR en el controlador obtenerPacientePorId:', error);
    return errorResponse(res, 'Error al obtener el paciente', 500);
  }
}

// /api/patients
async function createPatient(req, res) {
  try {
    const patientData = req.body;
    
    // Validar datos
    const validation = validatePatientData(patientData);
    if (!validation.isValid) {
      return validationErrorResponse(res, validation.errors);
    }
    
    // Crear paciente
    const newPatient = await patientService.createPatient(patientData);
    
    return successResponse(res, newPatient, 'Paciente se creo con exito', 201);
  } catch (error) {
    console.error('ERROR en el controlador createPatien:', error);
    
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return errorResponse(res, 'El correo ya existe', 409);
    }
    
    // Errors de Oracle
    if (error.errorNum) {
      if (error.errorNum === 1) {
        return errorResponse(res, 'El correo ya existe', 409);
      }
    }
    
    return errorResponse(res, 'Error al crear el paciente', 500);
  }
}

// /api/patients/:id
async function updatePatient(req, res) {
  try {
    const id = parseInt(req.params.id);
    const patientData = req.body;
    
    if (isNaN(id) || id < 1) {
      return errorResponse(res, 'id del paciente no es valido', 400);
    }
    
    // Validar datos
    const validation = validatePatientData(patientData);
    if (!validation.isValid) {
      return validationErrorResponse(res, validation.errors);
    }
    
    // Actualizar paciente
    const updatedPatient = await patientService.updatePatient(id, patientData);
    
    if (!updatedPatient) {
      return notFoundResponse(res, 'Paciente no encontrado');
    }
    
    return successResponse(res, updatedPatient, 'Paciente actualizado exitosamente');
  } catch (error) {
    console.error('ERROR en el controlador updatePatient:', error);
    
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return errorResponse(res, 'El correo electrónico ya existe', 409);
    }
    
 
    if (error.errorNum) {
      if (error.errorNum === 1) {
        return errorResponse(res, 'El correo electrónico ya existe', 409);
      }
    }
    
    return errorResponse(res, 'ERROR al actualizar paciente', 500);
  }
}

// /api/patients/:id

async function deletePatient(req, res) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
      return errorResponse(res, 'El id del paciente no es valido', 400);
    }
    
    const deleted = await patientService.deletePatient(id);
    
    if (!deleted) {
      return notFoundResponse(res, 'Paciente no encontrado');
    }
    
    return successResponse(res, null, 'Paciente eliminado exitosamente');
  } catch (error) {
    console.error('ERROR en el controlador deletePatient:', error);
    return errorResponse(res, 'Error al eliminar el paciente', 500);
  }
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};