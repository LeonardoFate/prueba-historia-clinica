const { validateEnv } = require('./src/config/env');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    validateEnv();
    
    app.listen(PORT, () => {
      console.log('********************************');
      console.log('✓ Server iniciado correctamente');
      console.log(`✓ Port: ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API URL: http://localhost:${PORT}/api`);
      console.log('✓ Endpoints:');
      console.log(`  - Auth: http://localhost:${PORT}/api/auth`);
      console.log(`  - Patients: http://localhost:${PORT}/api/patients`);
      console.log(`  - Epago: http://localhost:${PORT}/api/epago`);
      console.log(`  - Health: http://localhost:${PORT}/api/health`);
      console.log('********************************');
    });
  } catch (error) {
    console.error('❌ ERROR al iniciar servidor:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Closing server gracefully...`);
  process.exit(0);
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