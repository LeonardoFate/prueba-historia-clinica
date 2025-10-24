const { validateEnv } = require('./src/config/env');
const database = require('./src/config/database');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;


async function startServer() {
  try {
    validateEnv();
    
    await database.initialize();
    
    app.listen(PORT, () => {
      console.log('********************************');
      console.log('Server iniciado correctamente');
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'dev'}`);
      console.log(`API URL: http://localhost:${PORT}/api`);
      console.log('********************************');
    });
  } catch (error) {
    console.error('ERROR al iniciar servidor:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Closing server gracefully...`);
  
  try {
    await database.close();
    console.log('Conexion cerrada con base de datos.');
    process.exit(0);
  } catch (error) {
    console.error('ERROR durante el apagado:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();