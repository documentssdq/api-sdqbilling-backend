const express = require('express');
const countriesController = require('../controllers/countriesController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const countriesValidator = require('../validators/countriesValidator');
const { moduleName, type } = require('../config/countriesConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), countriesController.getAll.bind(countriesController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), countriesController.getById.bind(countriesController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(countriesValidator.createCountries), countriesController.create.bind(countriesController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(countriesValidator.updateCountries), countriesController.update.bind(countriesController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), countriesController.status.bind(countriesController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), countriesController.delete.bind(countriesController));

module.exports = router;
