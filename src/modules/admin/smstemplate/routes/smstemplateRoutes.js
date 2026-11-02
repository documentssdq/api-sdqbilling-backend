const express = require('express');
const router = express.Router();
const smstemplateController = require('../controllers/smstemplateController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const smstemplateValidator = require('../validators/smstemplateValidator');

const smstemplateConfig = { moduleName: 'Smstemplate', type: 'group-access' };

router.get('/', authenticate, permission(smstemplateConfig, 'READ'), smstemplateController.getAll.bind(smstemplateController));
router.get('/:id', authenticate, permission(smstemplateConfig, 'READ'), smstemplateController.getById.bind(smstemplateController));
router.post('/', authenticate, permission(smstemplateConfig, 'WRITE'), validate(smstemplateValidator.createSmstemplate), smstemplateController.create.bind(smstemplateController));
router.put('/:id', authenticate, permission(smstemplateConfig, 'WRITE'), validate(smstemplateValidator.updateSmstemplate), smstemplateController.update.bind(smstemplateController));
router.put('/:id/status', authenticate, permission(smstemplateConfig, 'WRITE'), smstemplateController.status.bind(smstemplateController));
router.delete('/:id', authenticate, permission(smstemplateConfig, 'DELETE'), smstemplateController.delete.bind(smstemplateController));

module.exports = router;
