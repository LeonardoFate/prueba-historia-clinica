// manejo centralizado de errores
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Error de Base de Datos
  if (err.errorNum) {
    return res.status(500).json({
      success: false,
      message: 'Error de base de datos',
      error: {
        code: err.errorNum,
        message: err.message
      }
    });
  }

  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }

  // Error genérico
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

// rutas no encontradas

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
}

module.exports = {
  errorHandler,
  notFound
};