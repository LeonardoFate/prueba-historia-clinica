# Sistema de Gestión de Pacientes

## Tecnologías Utilizadas
- Backend: Node.js 18+ con Express
- Frontend: Angular 20
- Base de Datos: Oracle Database 12c+
- Testing: Jest(Back), Jasmin(Front)

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/LeonardoFate/prueba-historia-clinica
cd prueba-historia-clinica
```

### 2. Configurar Oracle Database
Para levantar rápidamente una base Oracle Database 12c+ usando Docker, puedes ejecutar el siguiente comando:
```sql
docker run -d --name prueba-clinica -p 1521:1521 -p 5500:5500 gvenzl/oracle-free:latest
```
Luego, puedes conectarte a la base con:
```sql
sqlplus usuario/contrasenia@localhost:1521/XEPDB1
```

```sql
-- Crear usuario (como SYSDBA)
CREATE USER usuario IDENTIFIED BY contrasenia;
GRANT CONNECT, RESOURCE TO usuario;
GRANT CREATE SESSION TO usuario;
GRANT UNLIMITED TABLESPACE TO usuario;

-- Ejecutar script
sqlplus usuario/contrasenia@localhost:1521/XEPDB1 @backend/schema.sql
```

### 3. Instalar Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm start  # Puerto 3000
```

### 4. Instalar Frontend
```bash
cd frontend
npm install
ng serve  # Puerto 4200
```

## Decisiones Técnicas

1. **Connection Pool**: Configurado con min=2, max=10 para optimizar rendimiento
2. **Bind Variables**: Usadas en todas las queries para prevenir SQL injection
3. **Rate Limiting**: Implementado en dos niveles (general y estricto)
4. **Standalone Components**: Angular 19 con arquitectura moderna
5. **Reactive Forms**: Para validación robusta en frontend
