const oracledb = require('oracledb');

// Configuración pool de conexion
const poolConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: parseInt(process.env.POOL_MIN) || 2,
  poolMax: parseInt(process.env.POOL_MAX) || 10,
  poolIncrement: parseInt(process.env.POOL_INCREMENT) || 2,
  poolTimeout: 60
};

let pool;


async function initialize() {
  try {
    pool = await oracledb.createPool(poolConfig);
    console.info(`Pool creado con éxito. Configuración: mínimo=${poolConfig.poolMin}, máximo=${poolConfig.poolMax}`);
  } catch (err) {
    console.error('ERROR al crear el pool de conexiones a Oracle:', err.message);
    throw err;
  }
}

async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error('Error al obtener una conexión del pool:', err);
    throw err;
  }
}


async function close() {
  try {
    if (pool) {
      await pool.close(10);
      console.log('Pool de conexiones a Oracle cerrado correctamente');
    }
  } catch (err) {
    console.error('ERROR al cerrar pool:', err);
    throw err;
  }
}

module.exports = {
  initialize,
  getConnection,
  close
};