const { BaseController } = require('../../../../core');
  const ServicesService = require('../services/servicesService');

class ServicesController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await ServicesService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Services fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await ServicesService.getById(req.params.id);
      if (!data) return this.error(res, 'Services not found', 404);
      this.success(res, data, 'Services fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await ServicesService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Services', data._id, 'CREATE', req.body);
      this.success(res, data, 'Services created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await ServicesService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Services', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Services updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await ServicesService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'Services', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Services status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await ServicesService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Services', req.params.id, 'DELETE', data);
      await ServicesService.delete(req.params.id);
      this.success(res, null, 'Services deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new ServicesController();
