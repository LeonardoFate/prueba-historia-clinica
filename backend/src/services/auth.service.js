const { mockUsers } = require('../data/mockData');

// Simulación de login (sin encriptación para simplificar)
async function login(username, password) {
  try {
    // Buscar usuario
    const user = mockUsers.find(u => 
      u.username === username && u.password === password
    );
    
    if (!user) {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos'
      };
    }
    
    // Generar un "token" simple (en producción usaría JWT)
    const token = `fake-jwt-token-${user.id}-${Date.now()}`;
    
    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('ERROR en login:', error);
    throw error;
  }
}

// Verificar token (simplificado)
async function verifyToken(token) {
  try {
    // En un sistema real, verificaríamos el JWT
    // Aquí solo verificamos que el token tenga el formato esperado
    if (token && token.startsWith('fake-jwt-token-')) {
      return { valid: true };
    }
    return { valid: false };
  } catch (error) {
    console.error('ERROR en verifyToken:', error);
    return { valid: false };
  }
}

module.exports = {
  login,
  verifyToken
};