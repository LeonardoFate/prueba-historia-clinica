const {
  isValidEmail,
  isValidPhone,
  isValidBirthDate,
  isNotEmpty,
  validatePatientData,
  sanitizeSearchTerm
} = require('../../src/utils/validators');

describe('Validators - isValidEmail', () => {
  test('debe validar emails correctos', () => {
    expect(isValidEmail('test@email.com')).toBe(true);
    expect(isValidEmail('usuario.nombre@dominio.com')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  test('debe rechazar emails inválidos', () => {
    expect(isValidEmail('invalido')).toBe(false);
    expect(isValidEmail('sin@dominio')).toBe(false);
    expect(isValidEmail('@dominio.com')).toBe(false);
    expect(isValidEmail('usuario@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('Validators - isValidPhone', () => {
  test('debe validar teléfonos de 10 dígitos', () => {
    expect(isValidPhone('0999999999')).toBe(true);
    expect(isValidPhone('0123456789')).toBe(true);
  });

  test('debe rechazar teléfonos inválidos', () => {
    expect(isValidPhone('099999999')).toBe(false); // 9 dígitos
    expect(isValidPhone('09999999999')).toBe(false); // 11 dígitos
    expect(isValidPhone('099999999a')).toBe(false); // Con letra
    expect(isValidPhone('099-999-9999')).toBe(false); // Con guiones
    expect(isValidPhone('')).toBe(false);
  });
});

describe('Validators - isValidBirthDate', () => {
  test('debe validar fechas correctas', () => {
    expect(isValidBirthDate('1990-01-15')).toBe(true);
    expect(isValidBirthDate('2000-12-31')).toBe(true);
    expect(isValidBirthDate('1950-06-15')).toBe(true);
  });

  test('debe rechazar fechas futuras', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    expect(isValidBirthDate(futureDateString)).toBe(false);
    expect(isValidBirthDate('2030-01-01')).toBe(false);
  });

  test('debe rechazar fechas muy antiguas', () => {
    expect(isValidBirthDate('1899-12-31')).toBe(false);
    expect(isValidBirthDate('1800-01-01')).toBe(false);
  });

  test('debe rechazar fechas con más de 150 años', () => {
    const veryOldDate = new Date();
    veryOldDate.setFullYear(veryOldDate.getFullYear() - 151);
    const veryOldDateString = veryOldDate.toISOString().split('T')[0];
    
    expect(isValidBirthDate(veryOldDateString)).toBe(false);
  });
});

describe('Validators - isNotEmpty', () => {
  test('debe validar strings no vacíos', () => {
    expect(isNotEmpty('texto')).toBe(true);
    expect(isNotEmpty('   texto   ')).toBe(true); // Con espacios
  });

  test('debe rechazar valores vacíos o inválidos', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false); // Solo espacios
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
    expect(isNotEmpty(123)).toBe(false); // No es string
  });
});

describe('Validators - validatePatientData', () => {
  const validPatient = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@email.com',
    phone: '0999999999',
    birthDate: '1990-01-15'
  };

  test('debe validar datos correctos', () => {
    const result = validatePatientData(validPatient);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('debe rechazar si data no es un objeto', () => {
    expect(validatePatientData(null).isValid).toBe(false);
    expect(validatePatientData([]).isValid).toBe(false);
    expect(validatePatientData('string').isValid).toBe(false);
  });

  test('debe rechazar tipos incorrectos', () => {
    const invalidTypePatient = {
      ...validPatient,
      firstName: 123 // Debería ser string
    };
    
    const result = validatePatientData(invalidTypePatient);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('debe rechazar campos vacíos', () => {
    const emptyFieldPatient = {
      ...validPatient,
      firstName: ''
    };
    
    const result = validatePatientData(emptyFieldPatient);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('debe rechazar teléfono inválido', () => {
    const invalidPhonePatient = {
      ...validPatient,
      phone: '123'
    };
    
    const result = validatePatientData(invalidPhonePatient);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('debe rechazar fecha de nacimiento futura', () => {
    const futureDatePatient = {
      ...validPatient,
      birthDate: '2030-01-01'
    };
    
    const result = validatePatientData(futureDatePatient);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('debe rechazar campos que excedan longitud máxima', () => {
    const longNamePatient = {
      ...validPatient,
      firstName: 'A'.repeat(101) // Más de 100 caracteres
    };
    
    const result = validatePatientData(longNamePatient);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('Validators - sanitizeSearchTerm', () => {
  test('debe retornar string vacío para valores inválidos', () => {
    expect(sanitizeSearchTerm(null)).toBe('');
    expect(sanitizeSearchTerm(undefined)).toBe('');
    expect(sanitizeSearchTerm(123)).toBe('');
  });

  test('debe mantener texto normal sin cambios', () => {
    expect(sanitizeSearchTerm('juan')).toBe('juan');
    expect(sanitizeSearchTerm('Maria Lopez')).toBe('Maria Lopez');
  });

  test('debe escapar el carácter %', () => {
    expect(sanitizeSearchTerm('juan%')).toBe('juan\\%');
    expect(sanitizeSearchTerm('%test%')).toBe('\\%test\\%');
  });

  test('debe escapar el carácter _', () => {
    expect(sanitizeSearchTerm('juan_perez')).toBe('juan\\_perez');
    expect(sanitizeSearchTerm('_test_')).toBe('\\_test\\_');
  });

  test('debe escapar backslashes', () => {
    expect(sanitizeSearchTerm('juan\\test')).toBe('juan\\\\test');
  });

  test('debe escapar múltiples caracteres especiales', () => {
    expect(sanitizeSearchTerm('juan%_test\\')).toBe('juan\\%\\_test\\\\');
  });
});