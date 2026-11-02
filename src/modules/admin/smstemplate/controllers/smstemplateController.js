const { BaseController } = require('../../../../core');
const SmstemplateService = require('../services/smstemplateService');

class SmstemplateController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await SmstemplateService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Smstemplate fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await SmstemplateService.getById(req.params.id);
      if (!data) return this.error(res, 'Smstemplate not found', 404);
      this.success(res, data, 'Smstemplate fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await SmstemplateService.create(req.body);
      await this.logActivity(req, 'Smstemplate', data._id, 'CREATE', req.body);
      this.success(res, data, 'Smstemplate created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await SmstemplateService.update(req.params.id, req.body);
      await this.logActivity(req, 'Smstemplate', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Smstemplate updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await SmstemplateService.status(req.params.id, status);
      await this.logActivity(req, 'Smstemplate', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Smstemplate status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await SmstemplateService.getById(req.params.id);
      await this.logActivity(req, 'Smstemplate', req.params.id, 'DELETE', data);
      await SmstemplateService.delete(req.params.id);
      this.success(res, null, 'Smstemplate deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new SmstemplateController();
