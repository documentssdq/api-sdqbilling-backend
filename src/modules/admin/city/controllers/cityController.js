const { BaseController } = require('../../../../core');
  const CityService = require('../services/cityService');

class CityController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await CityService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'City fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await CityService.getById(req.params.id);
      if (!data) return this.error(res, 'City not found', 404);
      this.success(res, data, 'City fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await CityService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'City', data._id, 'CREATE', req.body);
      this.success(res, data, 'City created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await CityService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'City', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'City updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await CityService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'City', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'City status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await CityService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'City', req.params.id, 'DELETE', data);
      await CityService.delete(req.params.id);
      this.success(res, null, 'City deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new CityController();
