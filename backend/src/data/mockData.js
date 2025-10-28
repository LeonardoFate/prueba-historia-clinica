

const mockPatients = [
  {
    ID: 1,
    FIRST_NAME: 'Juan',
    LAST_NAME: 'Pérez García',
    EMAIL: 'juan.perez@email.com',
    PHONE: '0999999999',
    BIRTH_DATE: '1990-01-15',
    CREATED_AT: '2024-01-15T10:30:00',
    UPDATED_AT: '2024-01-15T10:30:00'
  },
  {
    ID: 2,
    FIRST_NAME: 'María',
    LAST_NAME: 'González López',
    EMAIL: 'maria.gonzalez@email.com',
    PHONE: '0988888888',
    BIRTH_DATE: '1985-05-20',
    CREATED_AT: '2024-01-16T11:00:00',
    UPDATED_AT: '2024-01-16T11:00:00'
  },
  {
    ID: 3,
    FIRST_NAME: 'Carlos',
    LAST_NAME: 'Rodríguez Martínez',
    EMAIL: 'carlos.rodriguez@email.com',
    PHONE: '0977777777',
    BIRTH_DATE: '1992-08-10',
    CREATED_AT: '2024-01-17T09:15:00',
    UPDATED_AT: '2024-01-17T09:15:00'
  },
  {
    ID: 4,
    FIRST_NAME: 'Ana',
    LAST_NAME: 'Martínez Silva',
    EMAIL: 'ana.martinez@email.com',
    PHONE: '0966666666',
    BIRTH_DATE: '1988-12-03',
    CREATED_AT: '2024-01-18T14:20:00',
    UPDATED_AT: '2024-01-18T14:20:00'
  },
  {
    ID: 5,
    FIRST_NAME: 'Luis',
    LAST_NAME: 'Fernández Ruiz',
    EMAIL: 'luis.fernandez@email.com',
    PHONE: '0955555555',
    BIRTH_DATE: '1995-03-25',
    CREATED_AT: '2024-01-19T16:45:00',
    UPDATED_AT: '2024-01-19T16:45:00'
  },
  {
    ID: 6,
    FIRST_NAME: 'Sofia',
    LAST_NAME: 'Torres Mendoza',
    EMAIL: 'sofia.torres@email.com',
    PHONE: '0944444444',
    BIRTH_DATE: '1993-07-12',
    CREATED_AT: '2024-01-20T08:30:00',
    UPDATED_AT: '2024-01-20T08:30:00'
  },
  {
    ID: 7,
    FIRST_NAME: 'Diego',
    LAST_NAME: 'Vargas Castro',
    EMAIL: 'diego.vargas@email.com',
    PHONE: '0933333333',
    BIRTH_DATE: '1987-11-28',
    CREATED_AT: '2024-01-21T13:10:00',
    UPDATED_AT: '2024-01-21T13:10:00'
  },
  {
    ID: 8,
    FIRST_NAME: 'Laura',
    LAST_NAME: 'Jiménez Mora',
    EMAIL: 'laura.jimenez@email.com',
    PHONE: '0922222222',
    BIRTH_DATE: '1991-04-17',
    CREATED_AT: '2024-01-22T10:25:00',
    UPDATED_AT: '2024-01-22T10:25:00'
  }
];

// Mock de usuarios para login
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', 
    name: 'Administrador',
    email: 'admin@phantomx.com'
  }
];

const mockEpagoTransactions = [
  {
    id: 1,
    codigoEpago: '3164667',
    fechaSolicitud: '07/04/2023 23:57:38',
    usuarioIngreso: 'LATINOMEDICAL',
    botonPago: 'BP001',
    valor: 3.00,
    estaPagado: true,
    estaFacturado: true,
    valorFacturado: 0.00,
    valorPorFacturar: 0.00,
    valorAnulado: 0.00
  },
  {
    id: 2,
    codigoEpago: '3164655',
    fechaSolicitud: '07/04/2023 23:26:40',
    usuarioIngreso: 'LATINOMEDICAL',
    botonPago: 'BP002',
    valor: 7.13,
    estaPagado: true,
    estaFacturado: true,
    valorFacturado: 0.00,
    valorPorFacturar: 0.00,
    valorAnulado: 0.00
  },
  {
    id: 3,
    codigoEpago: '3164653',
    fechaSolicitud: '07/04/2023 23:20:18',
    usuarioIngreso: 'LATINOMEDICAL',
    botonPago: 'BP003',
    valor: 7.13,
    estaPagado: true,
    estaFacturado: true,
    valorFacturado: 0.00,
    valorPorFacturar: 0.00,
    valorAnulado: 0.00
  },
  {
    id: 4,
    codigoEpago: '3164651',
    fechaSolicitud: '07/04/2023 23:19:29',
    usuarioIngreso: 'LATINOMEDICAL',
    botonPago: 'BP004',
    valor: 7.13,
    estaPagado: true,
    estaFacturado: true,
    valorFacturado: 0.00,
    valorPorFacturar: 0.00,
    valorAnulado: 0.00
  },
  {
    id: 5,
    codigoEpago: '3164643',
    fechaSolicitud: '07/04/2023 22:51:49',
    usuarioIngreso: 'LATINOMEDICAL',
    botonPago: 'BP005',
    valor: 4.75,
    estaPagado: true,
    estaFacturado: true,
    valorFacturado: 0.00,
    valorPorFacturar: 0.00,
    valorAnulado: 0.00
  },
  {
    id: 6,
    codigoEpago: '3164639',
    fechaSolicitud: '07/04/2023 22:46:28',
    usuarioIngreso: 'LATINOMEDICAL',
    botonPago: 'BP006',
    valor: 10.80,
    estaPagado: true,
    estaFacturado: true,
    valorFacturado: 0.00,
    valorPorFacturar: 0.00,
    valorAnulado: 0.00
  }
];

module.exports = {
  mockPatients,
  mockUsers,
  mockEpagoTransactions
};