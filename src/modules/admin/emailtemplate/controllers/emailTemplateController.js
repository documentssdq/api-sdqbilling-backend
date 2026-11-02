const { BaseController } = require('../../../../core');
const EmailTemplateService = require('../services/emailTemplateService');

class EmailTemplateController extends BaseController {
  /**
   * @description Fetch all email templates with pagination
   * @route GET /emailtemplate
   * @access Private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;

      const data = await EmailTemplateService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Email templates fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  /**
   * @description Fetch email template by ID
   * @route GET /emailtemplate/:id
   * @access Private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async getById(req, res) {
    try {
      const data = await EmailTemplateService.getById(req.params.id);
      if (!data) {
        return this.error(res, 'Email template not found', 404);
      }
      this.success(res, data, 'Email template fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  /**
   * @description Create new email template
   * @route POST /emailtemplate
   * @access Private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async create(req, res) {
    try {
      const data = await EmailTemplateService.create(req.body);
      // Log Activities
      await this.logActivity(req, 'EmailTemplate', data._id, 'CREATE', req.body);
      this.success(res, data, 'Email template created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  /**
   * @description Update email template
   * @route PUT /emailtemplate/:id
   * @access Private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async update(req, res) {
    try {
      const data = await EmailTemplateService.update(req.params.id, req.body);
      
      // Log Activities
      await this.logActivity(req, 'EmailTemplate', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Email template updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  /**
   * @description Update email template status
   * @route PUT /emailtemplate/:id/status
   * @access Private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await EmailTemplateService.status(req.params.id, status);
      // Log Activities
      await this.logActivity(req, 'EmailTemplate', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Email template status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  /**
   * @description Delete email template
   * @route DELETE /emailtemplate/:id
   * @access Private
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async delete(req, res) {
    try {
      const data = await EmailTemplateService.getById(req.params.id);
      // Log Activities
      await this.logActivity(req, 'EmailTemplate', req.params.id, 'DELETE', data);
      await EmailTemplateService.delete(req.params.id);
      this.success(res, null, 'Email template deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new EmailTemplateController();
