
// Valida si un email tiene formato válido
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Valida si un teléfono tiene 10 dígitos
function isValidPhone(phone) {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

// Valida si una fecha no es futura y está en rango realista
function isValidBirthDate(date) {
  // Validar formato YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const birthDate = new Date(date);
  
  // Verificar que sea una fecha válida
  if (isNaN(birthDate.getTime())) {
    return false;
  }
  
  // Verificar que no sea futura
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (birthDate > today) {
    return false;
  }
  
  // Verificar rango realista (no menor a 1900)
  const minDate = new Date('1900-01-01');
  if (birthDate < minDate) {
    return false;
  }
  
  // Verificar que no sea mayor a 150 años
  const maxAge = new Date();
  maxAge.setFullYear(maxAge.getFullYear() - 150);
  if (birthDate < maxAge) {
    return false;
  }
  
  return true;
}

// Valida si una cadena no está vacía
function isNotEmpty(str) {
  if (!str) return false;
  if (typeof str !== 'string') return false;
  return str.trim().length > 0;
}

// Valida todos los campos requeridos de un paciente
function validatePatientData(data) {
  const errors = [];

  // Validar que data sea un objeto válido
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    errors.push('Los datos deben ser un objeto JSON válido');
    return { isValid: false, errors };
  }

  if (data.firstName !== undefined && typeof data.firstName !== 'string') {
    errors.push('El nombre debe ser texto');
  }

  if (data.lastName !== undefined && typeof data.lastName !== 'string') {
    errors.push('El apellido debe ser texto');
  }

  if (data.email !== undefined && typeof data.email !== 'string') {
    errors.push('El email debe ser texto');
  }

  if (data.phone !== undefined && typeof data.phone !== 'string') {
    errors.push('El teléfono debe ser texto');
  }

  if (data.birthDate !== undefined && typeof data.birthDate !== 'string') {
    errors.push('La fecha de nacimiento debe ser texto en formato YYYY-MM-DD');
  }

  // Si hay errores de tipo, retornar inmediatamente
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Nombre
  if (!isNotEmpty(data.firstName)) {
    errors.push('El nombre es obligatorio');
  } else if (data.firstName.length > 100) {
    errors.push('El nombre no puede exceder 100 caracteres');
  }

  // Apellido
  if (!isNotEmpty(data.lastName)) {
    errors.push('El apellido es obligatorio');
  } else if (data.lastName.length > 100) {
    errors.push('El apellido no puede exceder 100 caracteres');
  }

  // Email
  if (!isNotEmpty(data.email)) {
    errors.push('El correo electrónico es obligatorio');
  } else if (!isValidEmail(data.email)) {
    errors.push('El formato del correo electrónico no es válido');
  } else if (data.email.length > 150) {
    errors.push('El correo electrónico no puede exceder 150 caracteres');
  }

  // Teléfono
  if (!isNotEmpty(data.phone)) {
    errors.push('El teléfono es obligatorio');
  } else if (!isValidPhone(data.phone)) {
    errors.push('El teléfono debe tener exactamente 10 dígitos');
  }

  // Fecha de nacimiento
  if (!data.birthDate) {
    errors.push('La fecha de nacimiento es obligatoria');
  } else if (!isValidBirthDate(data.birthDate)) {
    errors.push('La fecha de nacimiento no es válida, está en el futuro o fuera del rango permitido (1900-presente)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitiza el término de búsqueda para inyecciones
function sanitizeSearchTerm(search) {
  if (!search || typeof search !== 'string') {
    return '';
  }
  
  // Escapar caracteres especiales de SQL LIKE
  return search
    .replace(/\\/g, '\\\\')  
    .replace(/%/g, '\\%')    
    .replace(/_/g, '\\_');   
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidBirthDate,
  isNotEmpty,
  validatePatientData,
  sanitizeSearchTerm
};