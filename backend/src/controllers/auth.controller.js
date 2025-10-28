const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responses');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // Validaciones básicas
    if (!username || !password) {
      return errorResponse(res, 'Usuario y contraseña son requeridos', 400);
    }
    
    // Intentar login
    const result = await authService.login(username, password);
    
    if (!result.success) {
      return errorResponse(res, result.message, 401);
    }
    
    return successResponse(res, result, 'Login exitoso');
  } catch (error) {
    console.error('ERROR en controlador login:', error);
    return errorResponse(res, 'Error al iniciar sesión', 500);
  }
}

// POST /api/auth/verify
async function verifyToken(req, res) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return errorResponse(res, 'Token no proporcionado', 401);
    }
    
    const result = await authService.verifyToken(token);
    
    if (!result.valid) {
      return errorResponse(res, 'Token inválido', 401);
    }
    
    return successResponse(res, { valid: true }, 'Token válido');
  } catch (error) {
    console.error('ERROR en controlador verifyToken:', error);
    return errorResponse(res, 'Error al verificar token', 500);
  }
}

module.exports = {
  login,
  verifyToken
};