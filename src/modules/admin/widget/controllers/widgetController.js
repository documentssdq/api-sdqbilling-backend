const { BaseController } = require('../../../../core');
const WidgetService = require('../services/widgetService');

class WidgetController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 100;
      const data = await WidgetService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Widgets fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await WidgetService.getById(req.params.id);
      if (!data) return this.error(res, 'Widget not found', 404);
      this.success(res, data, 'Widget fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await WidgetService.create(req.body);
      await this.logActivity(req, 'Widget', data._id, 'CREATE', req.body);
      this.success(res, data, 'Widget created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await WidgetService.update(req.params.id, req.body);
      await this.logActivity(req, 'Widget', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Widget updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await WidgetService.status(req.params.id, status);
      await this.logActivity(req, 'Widget', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Widget status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await WidgetService.getById(req.params.id);
      await this.logActivity(req, 'Widget', req.params.id, 'DELETE', data);
      await WidgetService.delete(req.params.id);
      this.success(res, null, 'Widget deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new WidgetController();
