const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../../src/utils/responses');

describe('Response Utilities', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('successResponse', () => {
    test('debe retornar respuesta exitosa con status 200 por defecto', () => {
      const data = { id: 1, name: 'Test' };
      
      successResponse(mockRes, data, 'Operación exitosa');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operación exitosa',
        data
      });
    });

    test('debe aceptar status code personalizado', () => {
      const data = { id: 1 };
      
      successResponse(mockRes, data, 'Creado', 201);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Creado',
        data
      });
    });

    test('debe usar mensaje por defecto si no se proporciona', () => {
      successResponse(mockRes, {});
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: {}
      });
    });
  });

  describe('errorResponse', () => {
    test('debe retornar respuesta de error con status 500 por defecto', () => {
      errorResponse(mockRes, 'Error interno');
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error interno'
      });
    });

    test('debe aceptar status code personalizado', () => {
      errorResponse(mockRes, 'No autorizado', 401);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'No autorizado'
      });
    });

    test('debe incluir errores adicionales si se proporcionan', () => {
      const errors = ['Error 1', 'Error 2'];
      
      errorResponse(mockRes, 'Errores múltiples', 400, errors);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Errores múltiples',
        errors
      });
    });

    test('debe usar mensaje por defecto si no se proporciona', () => {
      errorResponse(mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error'
      });
    });
  });

  describe('notFoundResponse', () => {
    test('debe retornar respuesta 404', () => {
      notFoundResponse(mockRes, 'Recurso no encontrado');
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Recurso no encontrado'
      });
    });

    test('debe usar mensaje por defecto', () => {
      notFoundResponse(mockRes);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });
  });

  describe('validationErrorResponse', () => {
    test('debe retornar respuesta 400 con errores de validación', () => {
      const errors = [
        'El nombre es obligatorio',
        'El email no es válido'
      ];
      
      validationErrorResponse(mockRes, errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors
      });
    });
  });
});