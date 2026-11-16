const express = require('express');
const saleorderController = require('../controllers/saleorderController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const saleorderValidator = require('../validators/saleorderValidator');
const { moduleName, type } = require('../config/saleorderConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), saleorderController.getAll.bind(saleorderController));
router.get('/next-number', authenticate, permission(moduleName, 'READ'), saleorderController.getNextNumber.bind(saleorderController));
router.get('/financial-years', authenticate, permission(moduleName, 'READ'), saleorderController.getFinancialYears.bind(saleorderController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), saleorderController.getById.bind(saleorderController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(saleorderValidator.createSaleorder), saleorderController.create.bind(saleorderController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(saleorderValidator.updateSaleorder), saleorderController.update.bind(saleorderController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), saleorderController.status.bind(saleorderController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), saleorderController.delete.bind(saleorderController));

module.exports = router;
