const express = require('express');
const stateController = require('../controllers/stateController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const stateValidator = require('../validators/stateValidator');
const { moduleName, type } = require('../config/stateConfig');

const router = express.Router();

router.get('/', authenticate, permission(moduleName, 'READ'), stateController.getAll.bind(stateController));
router.get('/:id', authenticate, permission(moduleName, 'READ'), stateController.getById.bind(stateController));
router.post('/', authenticate, permission(moduleName, 'WRITE'), validate(stateValidator.createState), stateController.create.bind(stateController));
router.put('/:id', authenticate, permission(moduleName, 'WRITE'), validate(stateValidator.updateState), stateController.update.bind(stateController));
router.patch('/status/:id', authenticate, permission(moduleName, 'WRITE'), stateController.status.bind(stateController));
router.delete('/:id', authenticate, permission(moduleName, 'DELETE'), stateController.delete.bind(stateController));

module.exports = router;
