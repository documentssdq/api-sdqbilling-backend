const express = require('express');
const unitController = require('../controllers/unitController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const unitValidator = require('../validators/unitValidator');
const { moduleName, type } = require('../config/unitConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), unitController.getAll.bind(unitController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), unitController.getById.bind(unitController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(unitValidator.createUnit), unitController.create.bind(unitController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(unitValidator.updateUnit), unitController.update.bind(unitController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), unitController.status.bind(unitController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), unitController.delete.bind(unitController));

module.exports = router;
