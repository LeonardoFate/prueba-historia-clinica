const express = require('express');
const router = express.Router();
const epagoController = require('../controllers/epago.controller');

// GET /api/epago
router.get('/', epagoController.getAllTransactions);

// GET /api/epago/:id
router.get('/:id', epagoController.getTransactionById);

// POST /api/epago
router.post('/', epagoController.createTransaction);

// PUT /api/epago/:id
router.put('/:id', epagoController.updateTransaction);

// DELETE /api/epago/:id
router.delete('/:id', epagoController.deleteTransaction);

module.exports = router;