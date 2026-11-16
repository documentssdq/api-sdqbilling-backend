const { BaseController } = require('../../../../core');
  const UnitService = require('../services/unitService');

class UnitController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await UnitService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Unit fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await UnitService.getById(req.params.id);
      if (!data) return this.error(res, 'Unit not found', 404);
      this.success(res, data, 'Unit fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await UnitService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Unit', data._id, 'CREATE', req.body);
      this.success(res, data, 'Unit created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await UnitService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Unit', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Unit updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await UnitService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'Unit', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Unit status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await UnitService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Unit', req.params.id, 'DELETE', data);
      await UnitService.delete(req.params.id);
      this.success(res, null, 'Unit deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new UnitController();
