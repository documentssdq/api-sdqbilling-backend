const express = require('express');
const purchaseController = require('../controllers/purchaseController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const purchaseValidator = require('../validators/purchaseValidator');
const { moduleName, type } = require('../config/purchaseConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), purchaseController.getAll.bind(purchaseController));
router.get('/next-number', authenticate, permission(moduleName, 'READ'), purchaseController.getNextNumber.bind(purchaseController));
router.get('/financial-years', authenticate, permission(moduleName, 'READ'), purchaseController.getFinancialYears.bind(purchaseController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), purchaseController.getById.bind(purchaseController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(purchaseValidator.createPurchase), purchaseController.create.bind(purchaseController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(purchaseValidator.updatePurchase), purchaseController.update.bind(purchaseController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), purchaseController.status.bind(purchaseController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), purchaseController.delete.bind(purchaseController));

module.exports = router;
