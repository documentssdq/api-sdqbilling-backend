const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplateController');
const { authenticate, permission } = require('../../../../middlewares');

const emailTemplateConfig = { moduleName: 'EmailTemplate', type: 'group-access' };

router.get('/', authenticate, permission(emailTemplateConfig, 'READ'), emailTemplateController.getAll.bind(emailTemplateController));
router.get('/:id', authenticate, permission(emailTemplateConfig, 'READ'), emailTemplateController.getById.bind(emailTemplateController));
router.post('/', authenticate, permission(emailTemplateConfig, 'WRITE'), emailTemplateController.create.bind(emailTemplateController));
router.put('/:id', authenticate, permission(emailTemplateConfig, 'WRITE'), emailTemplateController.update.bind(emailTemplateController));
router.put('/:id/status', authenticate, permission(emailTemplateConfig, 'WRITE'), emailTemplateController.status.bind(emailTemplateController));
router.delete('/:id', authenticate, permission(emailTemplateConfig, 'DELETE'), emailTemplateController.delete.bind(emailTemplateController));

module.exports = router;
