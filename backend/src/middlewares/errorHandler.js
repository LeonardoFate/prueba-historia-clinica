// Manejo centralizado de errores
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

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

// Rutas no encontradas
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