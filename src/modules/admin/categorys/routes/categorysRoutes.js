const express = require('express');
const categorysController = require('../controllers/categorysController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const categorysValidator = require('../validators/categorysValidator');
const { moduleName, type } = require('../config/categorysConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), categorysController.getAll.bind(categorysController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), categorysController.getById.bind(categorysController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(categorysValidator.createCategorys), categorysController.create.bind(categorysController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(categorysValidator.updateCategorys), categorysController.update.bind(categorysController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), categorysController.status.bind(categorysController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), categorysController.delete.bind(categorysController));

module.exports = router;
