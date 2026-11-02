const express = require('express');
const pageController = require('../controllers/pageController');
const { validate, authenticate, permission } = require('../../../../middlewares');
const pageValidator = require('../validators/pageValidator');

const pageConfig = { moduleName: 'Page', type: 'group-access' };

const router = express.Router();

router.get('/', authenticate, permission(pageConfig, 'READ'), pageController.getAll.bind(pageController));
router.get('/:id', authenticate, permission(pageConfig, 'READ'), pageController.getById.bind(pageController));
router.post('/', authenticate, permission(pageConfig, 'WRITE'), validate(pageValidator.createPage), pageController.create.bind(pageController));
router.put('/:id', authenticate, permission(pageConfig, 'WRITE'), validate(pageValidator.updatePage), pageController.update.bind(pageController));
router.patch('/status/:id', authenticate, permission(pageConfig, 'WRITE'), pageController.status.bind(pageController));
router.delete('/:id', authenticate, permission(pageConfig, 'DELETE'), pageController.delete.bind(pageController));

module.exports = router;
