const { BaseController } = require('../../../../core');
  const TaxrateService = require('../services/taxrateService');

class TaxrateController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const { page, limit, ...filter } = req.query;
      const data = await TaxrateService.getAll(pageNum, limitNum, filter);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Taxrate fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await TaxrateService.getById(req.params.id);
      if (!data) return this.error(res, 'Taxrate not found', 404);
      this.success(res, data, 'Taxrate fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await TaxrateService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Taxrate', data._id, 'CREATE', req.body);
      this.success(res, data, 'Taxrate created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await TaxrateService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Taxrate', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Taxrate updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await TaxrateService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'Taxrate', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Taxrate status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await TaxrateService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Taxrate', req.params.id, 'DELETE', data);
      await TaxrateService.delete(req.params.id);
      this.success(res, null, 'Taxrate deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new TaxrateController();
