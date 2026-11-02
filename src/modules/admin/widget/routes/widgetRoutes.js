const express = require('express');
const widgetController = require('../controllers/widgetController');
const { authenticate, permission } = require('../../../../middlewares');

const widgetConfig = { moduleName: 'Widget', type: 'group-access' };

const router = express.Router();

router.get('/', authenticate, permission(widgetConfig, 'READ'), widgetController.getAll.bind(widgetController));
router.get('/:id', authenticate, permission(widgetConfig, 'READ'), widgetController.getById.bind(widgetController));
router.post('/', authenticate, permission(widgetConfig, 'WRITE'), widgetController.create.bind(widgetController));
router.put('/:id', authenticate, permission(widgetConfig, 'WRITE'), widgetController.update.bind(widgetController));
router.patch('/status/:id', authenticate, permission(widgetConfig, 'WRITE'), widgetController.status.bind(widgetController));
router.delete('/:id', authenticate, permission(widgetConfig, 'DELETE'), widgetController.delete.bind(widgetController));

module.exports = router;
