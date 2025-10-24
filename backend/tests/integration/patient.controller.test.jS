const patientController = require('../../src/controllers/patient.controller');
const patientService = require('../../src/services/patient.service');
const { validatePatientData } = require('../../src/utils/validators');

// Mock de los servicios
jest.mock('../../src/services/patient.service');
jest.mock('../../src/utils/validators');

describe('Patient Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      query: {},
      params: {},
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('getAllPatients', () => {
    test('debe retornar lista de pacientes con paginación por defecto', async () => {
      const mockResult = {
        patients: [
          { id: 1, firstName: 'Juan', lastName: 'Pérez' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 1,
          limit: 10
        }
      };

      patientService.getAllPatients.mockResolvedValue(mockResult);

      await patientController.getAllPatients(mockReq, mockRes);

      expect(patientService.getAllPatients).toHaveBeenCalledWith(1, 10, '');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Pacientes obtenidos exitosamente',
        data: mockResult
      });
    });

    test('debe aceptar parámetros de paginación personalizados', async () => {
      mockReq.query = { page: '2', limit: '20', search: 'juan' };

      const mockResult = {
        patients: [],
        pagination: { currentPage: 2, totalPages: 1, totalRecords: 0, limit: 20 }
      };

      patientService.getAllPatients.mockResolvedValue(mockResult);

      await patientController.getAllPatients(mockReq, mockRes);

      expect(patientService.getAllPatients).toHaveBeenCalledWith(2, 20, 'juan');
    });

    test('debe rechazar página menor a 1', async () => {
      mockReq.query = { page: '0' };

      await patientController.getAllPatients(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'La página debe ser mayor que 0'
      });
    });

    test('debe rechazar límite fuera de rango', async () => {
      mockReq.query = { limit: '101' };

      await patientController.getAllPatients(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'El límite debe estar entre 1 y 100'
      });
    });

    test('debe manejar errores del servicio', async () => {
      patientService.getAllPatients.mockRejectedValue(new Error('DB Error'));

      await patientController.getAllPatients(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener los pacientes'
      });
    });
  });

  describe('getPatientById', () => {
    test('debe retornar paciente por ID', async () => {
      mockReq.params = { id: '1' };
      const mockPatient = { id: 1, firstName: 'Juan', lastName: 'Pérez' };

      patientService.getPatientById.mockResolvedValue(mockPatient);

      await patientController.getPatientById(mockReq, mockRes);

      expect(patientService.getPatientById).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paciente obtenido exitosamente',
        data: mockPatient
      });
    });

    test('debe retornar 404 si paciente no existe', async () => {
      mockReq.params = { id: '999' };

      patientService.getPatientById.mockResolvedValue(null);

      await patientController.getPatientById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No se encontro al paciente'
      });
    });

    test('debe rechazar ID inválido', async () => {
      mockReq.params = { id: 'abc' };

      await patientController.getPatientById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'id del paciente no valido'
      });
    });
  });

  describe('createPatient', () => {
    const validPatientData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@email.com',
      phone: '0999999999',
      birthDate: '1990-01-15'
    };

    test('debe crear paciente con datos válidos', async () => {
      mockReq.body = validPatientData;

      validatePatientData.mockReturnValue({
        isValid: true,
        errors: []
      });

      const mockNewPatient = { id: 1, ...validPatientData };
      patientService.createPatient.mockResolvedValue(mockNewPatient);

      await patientController.createPatient(mockReq, mockRes);

      expect(validatePatientData).toHaveBeenCalledWith(validPatientData);
      expect(patientService.createPatient).toHaveBeenCalledWith(validPatientData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paciente se creo con exito',
        data: mockNewPatient
      });
    });

    test('debe rechazar datos inválidos', async () => {
      mockReq.body = { firstName: '' };

      validatePatientData.mockReturnValue({
        isValid: false,
        errors: ['El nombre es obligatorio']
      });

      await patientController.createPatient(mockReq, mockRes);

      expect(patientService.createPatient).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: ['El nombre es obligatorio']
      });
    });

    test('debe manejar email duplicado', async () => {
      mockReq.body = validPatientData;

      validatePatientData.mockReturnValue({
        isValid: true,
        errors: []
      });

      patientService.createPatient.mockRejectedValue(
        new Error('EMAIL_ALREADY_EXISTS')
      );

      await patientController.createPatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'El correo ya existe'
      });
    });
  });

  describe('updatePatient', () => {
    const validPatientData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@email.com',
      phone: '0999999999',
      birthDate: '1990-01-15'
    };

    test('debe actualizar paciente con datos válidos', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = validPatientData;

      validatePatientData.mockReturnValue({
        isValid: true,
        errors: []
      });

      const mockUpdatedPatient = { id: 1, ...validPatientData };
      patientService.updatePatient.mockResolvedValue(mockUpdatedPatient);

      await patientController.updatePatient(mockReq, mockRes);

      expect(patientService.updatePatient).toHaveBeenCalledWith(1, validPatientData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paciente actualizado exitosamente',
        data: mockUpdatedPatient
      });
    });

    test('debe retornar 404 si paciente no existe', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = validPatientData;

      validatePatientData.mockReturnValue({
        isValid: true,
        errors: []
      });

      patientService.updatePatient.mockResolvedValue(null);

      await patientController.updatePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Paciente no encontrado'
      });
    });

    test('debe rechazar ID inválido', async () => {
      mockReq.params = { id: 'abc' };
      mockReq.body = validPatientData;

      await patientController.updatePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deletePatient', () => {
    test('debe eliminar paciente existente', async () => {
      mockReq.params = { id: '1' };

      patientService.deletePatient.mockResolvedValue(true);

      await patientController.deletePatient(mockReq, mockRes);

      expect(patientService.deletePatient).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paciente eliminado exitosamente',
        data: null
      });
    });

    test('debe retornar 404 si paciente no existe', async () => {
      mockReq.params = { id: '999' };

      patientService.deletePatient.mockResolvedValue(false);

      await patientController.deletePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Paciente no encontrado'
      });
    });

    test('debe rechazar ID inválido', async () => {
      mockReq.params = { id: 'abc' };

      await patientController.deletePatient(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});