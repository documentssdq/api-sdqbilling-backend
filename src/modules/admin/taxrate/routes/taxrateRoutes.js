const express = require('express');
const taxrateController = require('../controllers/taxrateController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const taxrateValidator = require('../validators/taxrateValidator');
const { moduleName, type } = require('../config/taxrateConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), taxrateController.getAll.bind(taxrateController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), taxrateController.getById.bind(taxrateController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(taxrateValidator.createTaxrate), taxrateController.create.bind(taxrateController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(taxrateValidator.updateTaxrate), taxrateController.update.bind(taxrateController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), taxrateController.status.bind(taxrateController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), taxrateController.delete.bind(taxrateController));

module.exports = router;
