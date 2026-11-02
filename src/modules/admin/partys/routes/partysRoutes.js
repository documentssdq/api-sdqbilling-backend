const express = require('express');
const partysController = require('../controllers/partysController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const partysValidator = require('../validators/partysValidator');
const { moduleName, type } = require('../config/partysConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), partysController.getAll.bind(partysController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), partysController.getById.bind(partysController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(partysValidator.createPartys), partysController.create.bind(partysController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(partysValidator.updatePartys), partysController.update.bind(partysController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), partysController.status.bind(partysController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), partysController.delete.bind(partysController));

module.exports = router;
