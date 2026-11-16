const express = require('express');
const purchaseorderController = require('../controllers/purchaseorderController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const purchaseorderValidator = require('../validators/purchaseorderValidator');
const { moduleName, type } = require('../config/purchaseorderConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), purchaseorderController.getAll.bind(purchaseorderController));
router.get('/next-number', authenticate, permission(moduleName, 'READ'), purchaseorderController.getNextNumber.bind(purchaseorderController));
router.get('/financial-years', authenticate, permission(moduleName, 'READ'), purchaseorderController.getFinancialYears.bind(purchaseorderController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), purchaseorderController.getById.bind(purchaseorderController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(purchaseorderValidator.createPurchaseorder), purchaseorderController.create.bind(purchaseorderController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(purchaseorderValidator.updatePurchaseorder), purchaseorderController.update.bind(purchaseorderController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), purchaseorderController.status.bind(purchaseorderController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), purchaseorderController.delete.bind(purchaseorderController));

module.exports = router;
