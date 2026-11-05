const express = require('express');
const currencyController = require('../controllers/currencyController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const currencyValidator = require('../validators/currencyValidator');
const { moduleName, type } = require('../config/currencyConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), currencyController.getAll.bind(currencyController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), currencyController.getById.bind(currencyController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(currencyValidator.createCurrency), currencyController.create.bind(currencyController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(currencyValidator.updateCurrency), currencyController.update.bind(currencyController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), currencyController.status.bind(currencyController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), currencyController.delete.bind(currencyController));

module.exports = router;
