const express = require('express');
const subcategorysController = require('../controllers/subcategorysController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const subcategorysValidator = require('../validators/subcategorysValidator');
const { moduleName, type } = require('../config/subcategorysConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), subcategorysController.getAll.bind(subcategorysController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), subcategorysController.getById.bind(subcategorysController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(subcategorysValidator.createSubcategorys), subcategorysController.create.bind(subcategorysController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(subcategorysValidator.updateSubcategorys), subcategorysController.update.bind(subcategorysController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), subcategorysController.status.bind(subcategorysController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), subcategorysController.delete.bind(subcategorysController));

module.exports = router;
