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

// Valida si una fecha no es futura
function isValidBirthDate(date) {
  const birthDate = new Date(date);
  const today = new Date();
  return birthDate <= today;
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

  if (!isNotEmpty(data.firstName)) {
    errors.push('El nombre es obligatorio');
  }

  if (!isNotEmpty(data.lastName)) {
    errors.push('El apellido es obligatorio');
  }

  if (!isNotEmpty(data.email)) {
    errors.push('El correo electrónico es obligatorio');
  } else if (!isValidEmail(data.email)) {
    errors.push('El formato del correo electrónico no es válido');
  }

  if (!isNotEmpty(data.phone)) {
    errors.push('El teléfono es obligatorio');
  } else if (!isValidPhone(data.phone)) {
    errors.push('El teléfono debe tener 10 dígitos');
  }

  if (!data.birthDate) {
    errors.push('La fecha de nacimiento es obligatoria');
  } else if (!isValidBirthDate(data.birthDate)) {
    errors.push('La fecha de nacimiento no puede estar en el futuro');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidBirthDate,
  isNotEmpty,
  validatePatientData
};