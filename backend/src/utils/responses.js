// respuesta exitosa
function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

// respuesta de error

function errorResponse(res, message = 'Error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

// respuesta de recurso no encontrado
function notFoundResponse(res, message = 'Resource not found') {
  return errorResponse(res, message, 404);
}

// respuesta de validación fallida
function validationErrorResponse(res, errors) {
  return errorResponse(res, 'Validation failed', 400, errors);
}

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
};