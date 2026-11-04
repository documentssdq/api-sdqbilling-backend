const express = require('express');
const cityController = require('../controllers/cityController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const cityValidator = require('../validators/cityValidator');
const { moduleName, type } = require('../config/cityConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), cityController.getAll.bind(cityController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), cityController.getById.bind(cityController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(cityValidator.createCity), cityController.create.bind(cityController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(cityValidator.updateCity), cityController.update.bind(cityController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), cityController.status.bind(cityController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), cityController.delete.bind(cityController));

module.exports = router;
