// Mock data en lugar de Oracle
const { mockPatients } = require('../data/mockData');

// Variable para simular la base de datos en memoria
let patients = [...mockPatients];
let nextId = Math.max(...patients.map(p => p.ID)) + 1;

// Obtiene los pacientes con paginación y búsqueda
async function getAllPatients(page = 1, limit = 10, search = '') {
  try {
    // Filtrar por búsqueda si existe
    let filteredPatients = [...patients];
    
    if (search && search.trim()) {
      const searchTerm = search.toUpperCase();
      filteredPatients = patients.filter(p => 
        p.FIRST_NAME.toUpperCase().includes(searchTerm) ||
        p.LAST_NAME.toUpperCase().includes(searchTerm)
      );
    }
    
    // Ordenar por fecha de creación (descendente)
    filteredPatients.sort((a, b) => 
      new Date(b.CREATED_AT) - new Date(a.CREATED_AT)
    );
    
    // Paginación
    const total = filteredPatients.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPatients = filteredPatients.slice(offset, offset + limit);
    
    return {
      patients: paginatedPatients,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    console.error('ERROR en getAllPatients:', error);
    throw error;
  }
}

// Obtener paciente por id
async function getPatientById(id) {
  try {
    const patient = patients.find(p => p.ID === parseInt(id));
    return patient || null;
  } catch (error) {
    console.error('ERROR en getPatientById:', error);
    throw error;
  }
}

// Verificar si el email ya existe
async function emailExists(email, excludeId = null) {
  try {
    const exists = patients.some(p => 
      p.EMAIL.toUpperCase() === email.toUpperCase() && 
      (!excludeId || p.ID !== excludeId)
    );
    return exists;
  } catch (error) {
    console.error('ERROR en emailExists:', error);
    throw error;
  }
}

// Crear nuevo paciente
async function createPatient(patientData) {
  try {
    // Verificar email único
    const exists = await emailExists(patientData.email);
    if (exists) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    
    // Crear nuevo paciente
    const newPatient = {
      ID: nextId++,
      FIRST_NAME: patientData.firstName,
      LAST_NAME: patientData.lastName,
      EMAIL: patientData.email,
      PHONE: patientData.phone,
      BIRTH_DATE: patientData.birthDate,
      CREATED_AT: new Date().toISOString(),
      UPDATED_AT: new Date().toISOString()
    };
    
    patients.push(newPatient);
    
    return newPatient;
  } catch (error) {
    console.error('ERROR en createPatient:', error);
    throw error;
  }
}

// Actualiza un paciente existente
async function updatePatient(id, patientData) {
  try {
    const index = patients.findIndex(p => p.ID === parseInt(id));
    
    if (index === -1) {
      return null;
    }
    
    // Verificar email único (excluyendo el paciente actual)
    const emailInUse = await emailExists(patientData.email, parseInt(id));
    if (emailInUse) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    
    // Actualizar paciente
    patients[index] = {
      ...patients[index],
      FIRST_NAME: patientData.firstName,
      LAST_NAME: patientData.lastName,
      EMAIL: patientData.email,
      PHONE: patientData.phone,
      BIRTH_DATE: patientData.birthDate,
      UPDATED_AT: new Date().toISOString()
    };
    
    return patients[index];
  } catch (error) {
    console.error('ERROR en updatePatient:', error);
    throw error;
  }
}

// Eliminar paciente
async function deletePatient(id) {
  try {
    const index = patients.findIndex(p => p.ID === parseInt(id));
    
    if (index === -1) {
      return false;
    }
    
    patients.splice(index, 1);
    return true;
  } catch (error) {
    console.error('ERROR en deletePatient:', error);
    throw error;
  }
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  emailExists
};