const patientService = require('../../src/services/patient.service');
const database = require('../../src/config/database');

// NO mockear - usar base de datos real
describe('Patient Service Integration Tests', () => {
  beforeAll(async () => {
    // Inicializar conexión a Oracle
    await database.initialize();
  });

  afterAll(async () => {
    // Cerrar pool al terminar tests
    await database.close();
  });

  describe('getAllPatients', () => {
    test('should return paginated patients', async () => {
      const result = await patientService.getAllPatients(1, 10, '');
      
      expect(result).toHaveProperty('patients');
      expect(result).toHaveProperty('pagination');
      expect(Array.isArray(result.patients)).toBe(true);
      expect(result.pagination).toHaveProperty('currentPage', 1);
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('totalRecords');
      expect(result.pagination).toHaveProperty('limit', 10);
    });

    test('should search patients by name', async () => {
      const result = await patientService.getAllPatients(1, 10, 'Juan');
      
      expect(result.patients).toBeDefined();
      // Si hay resultados, verificar que contengan "Juan"
      if (result.patients.length > 0) {
        const hasJuan = result.patients.some(p => 
          p.FIRST_NAME.toUpperCase().includes('JUAN') || 
          p.LAST_NAME.toUpperCase().includes('JUAN')
        );
        expect(hasJuan).toBe(true);
      }
    });

    test('should respect pagination limits', async () => {
      const result = await patientService.getAllPatients(1, 2, '');
      
      expect(result.patients.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getPatientById', () => {
    test('should return patient when exists', async () => {
      // Primero obtener lista para conseguir un ID válido
      const list = await patientService.getAllPatients(1, 1, '');
      
      if (list.patients.length > 0) {
        const patientId = list.patients[0].ID;
        const patient = await patientService.getPatientById(patientId);
        
        expect(patient).toBeDefined();
        expect(patient.ID).toBe(patientId);
        expect(patient).toHaveProperty('FIRST_NAME');
        expect(patient).toHaveProperty('LAST_NAME');
        expect(patient).toHaveProperty('EMAIL');
      }
    });

    test('should return null when patient does not exist', async () => {
      const patient = await patientService.getPatientById(999999);
      expect(patient).toBeNull();
    });
  });

  describe('createPatient', () => {
    const testPatient = {
      firstName: 'Test',
      lastName: 'Patient',
      email: `test.${Date.now()}@example.com`, // Email único con timestamp
      phone: '0987654321',
      birthDate: '1995-06-15'
    };

    let createdPatientId;

    test('should create a new patient', async () => {
      const newPatient = await patientService.createPatient(testPatient);
      
      expect(newPatient).toBeDefined();
      expect(newPatient.ID).toBeDefined();
      expect(newPatient.FIRST_NAME).toBe(testPatient.firstName);
      expect(newPatient.LAST_NAME).toBe(testPatient.lastName);
      expect(newPatient.EMAIL).toBe(testPatient.email);
      expect(newPatient.PHONE).toBe(testPatient.phone);
      
      createdPatientId = newPatient.ID;
    });

    test('should fail when email already exists', async () => {
      await expect(
        patientService.createPatient(testPatient)
      ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });

    // Cleanup: eliminar el paciente de prueba
    afterAll(async () => {
      if (createdPatientId) {
        try {
          await patientService.deletePatient(createdPatientId);
        } catch (error) {
          console.error('Error cleaning up test patient:', error);
        }
      }
    });
  });

  describe('updatePatient', () => {
    let testPatientId;
    const testPatient = {
      firstName: 'Update',
      lastName: 'Test',
      email: `update.${Date.now()}@example.com`,
      phone: '0976543210',
      birthDate: '1993-03-20'
    };

    beforeAll(async () => {
      // Crear paciente para actualizar
      const created = await patientService.createPatient(testPatient);
      testPatientId = created.ID;
    });

    test('should update existing patient', async () => {
      const updatedData = {
        ...testPatient,
        firstName: 'Updated',
        lastName: 'Name'
      };

      const updated = await patientService.updatePatient(testPatientId, updatedData);
      
      expect(updated).toBeDefined();
      expect(updated.FIRST_NAME).toBe('Updated');
      expect(updated.LAST_NAME).toBe('Name');
      expect(updated.EMAIL).toBe(testPatient.email);
    });

    test('should return null when updating non-existent patient', async () => {
      const result = await patientService.updatePatient(999999, testPatient);
      expect(result).toBeNull();
    });

    test('should fail when updating with existing email', async () => {
      // Obtener un email existente diferente
      const list = await patientService.getAllPatients(1, 2, '');
      if (list.patients.length > 1) {
        const existingEmail = list.patients.find(p => p.ID !== testPatientId)?.EMAIL;
        
        if (existingEmail) {
          const invalidData = { ...testPatient, email: existingEmail };
          
          await expect(
            patientService.updatePatient(testPatientId, invalidData)
          ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
        }
      }
    });

    afterAll(async () => {
      if (testPatientId) {
        try {
          await patientService.deletePatient(testPatientId);
        } catch (error) {
          console.error('Error cleaning up test patient:', error);
        }
      }
    });
  });

  describe('deletePatient', () => {
    let testPatientId;

    beforeEach(async () => {
      // Crear paciente para eliminar
      const testPatient = {
        firstName: 'Delete',
        lastName: 'Test',
        email: `delete.${Date.now()}@example.com`,
        phone: '0965432109',
        birthDate: '1991-11-11'
      };
      
      const created = await patientService.createPatient(testPatient);
      testPatientId = created.ID;
    });

    test('should delete existing patient', async () => {
      const result = await patientService.deletePatient(testPatientId);
      expect(result).toBe(true);
      
      // Verificar que ya no existe
      const deleted = await patientService.getPatientById(testPatientId);
      expect(deleted).toBeNull();
    });

    test('should return false when deleting non-existent patient', async () => {
      const result = await patientService.deletePatient(999999);
      expect(result).toBe(false);
    });
  });

  describe('emailExists', () => {
    test('should return true for existing email', async () => {
      const list = await patientService.getAllPatients(1, 1, '');
      
      if (list.patients.length > 0) {
        const existingEmail = list.patients[0].EMAIL;
        const exists = await patientService.emailExists(existingEmail);
        expect(exists).toBe(true);
      }
    });

    test('should return false for non-existent email', async () => {
      const exists = await patientService.emailExists(`nonexistent.${Date.now()}@test.com`);
      expect(exists).toBe(false);
    });

    test('should exclude specific ID when checking', async () => {
      const list = await patientService.getAllPatients(1, 1, '');
      
      if (list.patients.length > 0) {
        const patient = list.patients[0];
        // El mismo email NO debe existir si excluimos su propio ID
        const exists = await patientService.emailExists(patient.EMAIL, patient.ID);
        expect(exists).toBe(false);
      }
    });
  });
});