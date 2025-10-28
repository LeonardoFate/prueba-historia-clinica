const { mockEpagoTransactions } = require('../data/mockData');

// Variable para simular la base de datos en memoria
let transactions = [...mockEpagoTransactions];
let nextId = Math.max(...transactions.map(t => t.id)) + 1;

// Obtener todas las transacciones
async function getAllTransactions(filters = {}) {
  try {
    let filteredTransactions = [...transactions];
    
    // Filtrar por código Epago
    if (filters.codigoEpago && filters.codigoEpago.trim()) {
      filteredTransactions = filteredTransactions.filter(t =>
        t.codigoEpago.includes(filters.codigoEpago)
      );
    }
    
    // Filtrar por fechas (simplificado - en producción usar librería de fechas)
    if (filters.fechaDesde) {
      // Implementación básica de filtro de fechas
      filteredTransactions = filteredTransactions.filter(t => {
        return new Date(t.fechaSolicitud) >= new Date(filters.fechaDesde);
      });
    }
    
    if (filters.fechaHasta) {
      filteredTransactions = filteredTransactions.filter(t => {
        return new Date(t.fechaSolicitud) <= new Date(filters.fechaHasta);
      });
    }
    
    // Ordenar por fecha (descendente)
    filteredTransactions.sort((a, b) => 
      new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
    );
    
    return filteredTransactions;
  } catch (error) {
    console.error('ERROR en getAllTransactions:', error);
    throw error;
  }
}

// Obtener transacción por ID
async function getTransactionById(id) {
  try {
    const transaction = transactions.find(t => t.id === parseInt(id));
    return transaction || null;
  } catch (error) {
    console.error('ERROR en getTransactionById:', error);
    throw error;
  }
}

// Crear nueva transacción
async function createTransaction(transactionData) {
  try {
    const newTransaction = {
      id: nextId++,
      codigoEpago: transactionData.codigoEpago,
      fechaSolicitud: new Date().toLocaleString('es-EC'),
      usuarioIngreso: transactionData.usuarioIngreso || 'LATINOMEDICAL',
      botonPago: transactionData.botonPago,
      valor: parseFloat(transactionData.valor),
      estaPagado: transactionData.estaPagado || false,
      estaFacturado: transactionData.estaFacturado || false,
      valorFacturado: parseFloat(transactionData.valorFacturado) || 0.00,
      valorPorFacturar: parseFloat(transactionData.valorPorFacturar) || 0.00,
      valorAnulado: parseFloat(transactionData.valorAnulado) || 0.00
    };
    
    transactions.push(newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('ERROR en createTransaction:', error);
    throw error;
  }
}

// Actualizar transacción
async function updateTransaction(id, transactionData) {
  try {
    const index = transactions.findIndex(t => t.id === parseInt(id));
    
    if (index === -1) {
      return null;
    }
    
    transactions[index] = {
      ...transactions[index],
      codigoEpago: transactionData.codigoEpago,
      botonPago: transactionData.botonPago,
      valor: parseFloat(transactionData.valor),
      estaPagado: transactionData.estaPagado,
      estaFacturado: transactionData.estaFacturado,
      valorFacturado: parseFloat(transactionData.valorFacturado),
      valorPorFacturar: parseFloat(transactionData.valorPorFacturar),
      valorAnulado: parseFloat(transactionData.valorAnulado)
    };
    
    return transactions[index];
  } catch (error) {
    console.error('ERROR en updateTransaction:', error);
    throw error;
  }
}

// Eliminar transacción
async function deleteTransaction(id) {
  try {
    const index = transactions.findIndex(t => t.id === parseInt(id));
    
    if (index === -1) {
      return false;
    }
    
    transactions.splice(index, 1);
    return true;
  } catch (error) {
    console.error('ERROR en deleteTransaction:', error);
    throw error;
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};