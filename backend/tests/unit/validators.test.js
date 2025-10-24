const {
  isValidEmail,
  isValidPhone,
  isValidBirthDate,
  isNotEmpty,
  validatePatientData
} = require('../../src/utils/validators');

describe('Validators', () => {
  describe('isValidEmail', () => {
    test('should return true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('should return false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('should return true for 10 digit phone', () => {
      expect(isValidPhone('0999999999')).toBe(true);
    });

    test('should return false for invalid phone', () => {
      expect(isValidPhone('099999999')).toBe(false);
      expect(isValidPhone('09999999999')).toBe(false);
      expect(isValidPhone('099999999a')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidBirthDate', () => {
    test('should return true for past dates', () => {
      expect(isValidBirthDate('1990-01-15')).toBe(true);
      expect(isValidBirthDate('2000-06-20')).toBe(true);
    });

    test('should return false for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isValidBirthDate(futureDate.toISOString())).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    test('should return true for non-empty strings', () => {
      expect(isNotEmpty('test')).toBe(true);
      expect(isNotEmpty('  text  ')).toBe(true);
    });

    test('should return false for empty strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
    });
  });

  describe('validatePatientData', () => {
    const validPatient = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@example.com',
      phone: '0999999999',
      birthDate: '1990-01-15'
    };

    test('should validate correct patient data', () => {
      const result = validatePatientData(validPatient);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should fail when firstName is missing', () => {
      const invalid = { ...validPatient, firstName: '' };
      const result = validatePatientData(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('firstName is required');
    });

    test('should fail when email is invalid', () => {
      const invalid = { ...validPatient, email: 'invalid-email' };
      const result = validatePatientData(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email format is invalid');
    });

    test('should fail when phone is not 10 digits', () => {
      const invalid = { ...validPatient, phone: '123' };
      const result = validatePatientData(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('phone must be 10 digits');
    });

    test('should fail when birthDate is in future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invalid = { ...validPatient, birthDate: futureDate.toISOString() };
      const result = validatePatientData(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('birthDate cannot be in the future');
    });
  });
});