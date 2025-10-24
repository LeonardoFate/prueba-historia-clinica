# PRUEBA PRACTICA

Prueba práctica de desarrollo full-stack que implementa un sistema de gestión de historias clínicas utilizando Angular, Node.js/Express y Oracle Database.

## Tecnologías Utilizadas

### Backend
- **Node.js** con Express
- **Oracle Database** (oracledb)
- **Jest** para testing
- **express-validator** para validación
- **cors** para manejo de CORS
- **dotenv** para variables de entorno

### Frontend
- **Angular 20.1.0**
- **Bootstrap 5.3.8** para estilos
- **Jasmine/Karma** para testing

## Requisitos Previos

- Node.js (v18+)
- Docker
- npm o yarn

## Configuración de Base de Datos

### 1. Levantar contenedor Oracle Database

```bash
docker run -d \
  --name prueba-clinica \
  -p 1521:1521 \
  -p 5500:5500 \
  gvenzl/oracle-free:latest
```

### 2. Crear la estructura de base de datos

El archivo `schema.sql` en el directorio `backend` contiene el script de creación de la base de datos. Ejecutar:

```bash
# Conectarse al contenedor
docker exec -it prueba-clinica sqlplus system/oracle@localhost:1521/FREEPDB1

# Ejecutar el schema.sql
@/ruta/al/schema.sql
```

O manualmente importar el archivo `schema.sql` usando SQL Developer u otra herramienta.

## Instalación y Configuración

### Backend

1. **Navegar al directorio backend:**
```bash
cd backend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**

Crear archivo `.env` en la raíz del backend:

```env
DB_USER=usuario
DB_PASSWORD=contrasenia
DB_CONNECTION_STRING=localhost:1521/XEPDB1

# Connection Pool Configuration
POOL_MIN=2
POOL_MAX=10
POOL_INCREMENT=2

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:4200

```

4. **Iniciar el servidor:**

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El backend estará disponible en `http://localhost:3000`

### Frontend

1. **Navegar al directorio frontend:**
```bash
cd frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Iniciar la aplicación:**

```bash
# Desarrollo
npm start
# o
ng serve

# Build para producción
npm run build
```

La aplicación estará disponible en `http://localhost:4200`

## Testing

### Backend (Jest)

```bash
cd backend

# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests de integración
npm run test:integration

```

### Frontend (Jasmine/Karma)

```bash
cd frontend

# Ejecutar tests
npm test
# o
ng test

```

## Troubleshooting

### Problema: No se puede conectar a Oracle Database

**Solución:**
```bash
# Verificar que el contenedor esté corriendo
docker ps

# Verificar logs del contenedor
docker logs prueba-clinica

# Reiniciar el contenedor
docker restart prueba-clinica
```

### Problema: Error en tests de frontend

**Solución:**
```bash
# Limpiar caché de Angular
ng cache clean

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

