const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../../src/utils/responses');

describe('Response Helpers', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('successResponse', () => {
    test('should return success response with default status 200', () => {
      const data = { id: 1, name: 'Test' };
      successResponse(res, data, 'Success');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data
      });
    });

    test('should return success response with custom status', () => {
      successResponse(res, null, 'Created', 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
        data: null
      });
    });
  });

  describe('errorResponse', () => {
    test('should return error response', () => {
      errorResponse(res, 'Error occurred', 500);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error occurred'
      });
    });

    test('should include errors if provided', () => {
      const errors = ['Error 1', 'Error 2'];
      errorResponse(res, 'Validation failed', 400, errors);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors
      });
    });
  });

  describe('notFoundResponse', () => {
    test('should return 404 response', () => {
      notFoundResponse(res, 'Not found');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not found'
      });
    });
  });

  describe('validationErrorResponse', () => {
    test('should return 400 validation error', () => {
      const errors = ['Field required'];
      validationErrorResponse(res, errors);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors
      });
    });
  });
});