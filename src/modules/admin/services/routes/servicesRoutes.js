const express = require('express');
const servicesController = require('../controllers/servicesController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const servicesValidator = require('../validators/servicesValidator');
const { moduleName, type } = require('../config/servicesConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), servicesController.getAll.bind(servicesController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), servicesController.getById.bind(servicesController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(servicesValidator.createServices), servicesController.create.bind(servicesController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(servicesValidator.updateServices), servicesController.update.bind(servicesController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), servicesController.status.bind(servicesController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), servicesController.delete.bind(servicesController));

module.exports = router;
