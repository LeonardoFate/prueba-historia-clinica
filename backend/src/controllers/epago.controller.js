const epagoService = require('../services/epago.service');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/responses');

// GET /api/epago
async function getAllTransactions(req, res) {
  try {
    const filters = {
      codigoEpago: req.query.codigoEpago || '',
      fechaDesde: req.query.fechaDesde || '',
      fechaHasta: req.query.fechaHasta || ''
    };
    
    const transactions = await epagoService.getAllTransactions(filters);
    
    return successResponse(res, transactions, 'Transacciones obtenidas exitosamente');
  } catch (error) {
    console.error('ERROR en controlador getAllTransactions:', error);
    return errorResponse(res, 'Error al obtener las transacciones', 500);
  }
}

// GET /api/epago/:id
async function getTransactionById(req, res) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
      return errorResponse(res, 'ID de transacción no válido', 400);
    }
    
    const transaction = await epagoService.getTransactionById(id);
    
    if (!transaction) {
      return notFoundResponse(res, 'Transacción no encontrada');
    }
    
    return successResponse(res, transaction, 'Transacción obtenida exitosamente');
  } catch (error) {
    console.error('ERROR en controlador getTransactionById:', error);
    return errorResponse(res, 'Error al obtener la transacción', 500);
  }
}

// POST /api/epago
async function createTransaction(req, res) {
  try {
    const transactionData = req.body;
    
    // Validaciones básicas
    if (!transactionData.codigoEpago || !transactionData.codigoEpago.trim()) {
      return errorResponse(res, 'Código Epago es requerido', 400);
    }
    
    if (!transactionData.botonPago || !transactionData.botonPago.trim()) {
      return errorResponse(res, 'Botón de pago es requerido', 400);
    }
    
    if (!transactionData.valor || parseFloat(transactionData.valor) <= 0) {
      return errorResponse(res, 'Valor debe ser mayor a 0', 400);
    }
    
    const newTransaction = await epagoService.createTransaction(transactionData);
    
    return successResponse(res, newTransaction, 'Transacción creada exitosamente', 201);
  } catch (error) {
    console.error('ERROR en controlador createTransaction:', error);
    return errorResponse(res, 'Error al crear la transacción', 500);
  }
}

// PUT /api/epago/:id
async function updateTransaction(req, res) {
  try {
    const id = parseInt(req.params.id);
    const transactionData = req.body;
    
    if (isNaN(id) || id < 1) {
      return errorResponse(res, 'ID de transacción no válido', 400);
    }
    
    // Validaciones básicas
    if (!transactionData.codigoEpago || !transactionData.codigoEpago.trim()) {
      return errorResponse(res, 'Código Epago es requerido', 400);
    }
    
    if (!transactionData.botonPago || !transactionData.botonPago.trim()) {
      return errorResponse(res, 'Botón de pago es requerido', 400);
    }
    
    if (!transactionData.valor || parseFloat(transactionData.valor) <= 0) {
      return errorResponse(res, 'Valor debe ser mayor a 0', 400);
    }
    
    const updatedTransaction = await epagoService.updateTransaction(id, transactionData);
    
    if (!updatedTransaction) {
      return notFoundResponse(res, 'Transacción no encontrada');
    }
    
    return successResponse(res, updatedTransaction, 'Transacción actualizada exitosamente');
  } catch (error) {
    console.error('ERROR en controlador updateTransaction:', error);
    return errorResponse(res, 'Error al actualizar la transacción', 500);
  }
}

// DELETE /api/epago/:id
async function deleteTransaction(req, res) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
      return errorResponse(res, 'ID de transacción no válido', 400);
    }
    
    const deleted = await epagoService.deleteTransaction(id);
    
    if (!deleted) {
      return notFoundResponse(res, 'Transacción no encontrada');
    }
    
    return successResponse(res, null, 'Transacción eliminada exitosamente');
  } catch (error) {
    console.error('ERROR en controlador deleteTransaction:', error);
    return errorResponse(res, 'Error al eliminar la transacción', 500);
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};