const { BaseController } = require('../../../../core');
const StateService = require('../services/stateService');

class StateController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await StateService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'State fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await StateService.getById(req.params.id);
      if (!data) return this.error(res, 'State not found', 404);
      this.success(res, data, 'State fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await StateService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'State', data._id, 'CREATE', req.body);
      this.success(res, data, 'State created successfully', 201);
    } catch (error) {
      if (error.field) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
          errors: [{ field: error.field, message: error.message }],
        });
      }
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await StateService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'State', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'State updated successfully');
    } catch (error) {
      if (error.field) {
        return res.status(error.statusCode || 400).json({
          success: false,
          message: error.message,
          errors: [{ field: error.field, message: error.message }],
        });
      }
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await StateService.status(req.params.id, status);
      // Log Activities //
      await this.logActivity(req, 'State', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'State status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await StateService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'State', req.params.id, 'DELETE', data);
      await StateService.delete(req.params.id);
      this.success(res, null, 'State deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new StateController();
