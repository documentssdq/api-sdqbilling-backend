const { BaseController } = require('../../../../core');
const PartysService = require('../services/partysService');

class PartysController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await PartysService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Partys fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await PartysService.getById(req.params.id);
      if (!data) return this.error(res, 'Partys not found', 404);
      this.success(res, data, 'Partys fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await PartysService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Partys', data._id, 'CREATE', req.body);
      this.success(res, data, 'Party created successfully', 201);
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
        const labelMap = {
          name: 'Party name',
          phone: 'Phone / Mobile number',
          email: 'Email address',
        };
        const fieldLabel = labelMap[field] || field;
        return res.status(400).json({
          success: false,
          message: `${fieldLabel} already exists`,
          errors: [{ field, message: `${fieldLabel} is already registered with another party` }],
        });
      }
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
      const data = await PartysService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Partys', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Party updated successfully');
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || 'field';
        const labelMap = {
          name: 'Party name',
          phone: 'Phone / Mobile number',
          email: 'Email address',
        };
        const fieldLabel = labelMap[field] || field;
        return res.status(400).json({
          success: false,
          message: `${fieldLabel} already exists`,
          errors: [{ field, message: `${fieldLabel} is already registered with another party` }],
        });
      }
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
      const data = await PartysService.status(req.params.id, status);
      // Log Activities //
      await this.logActivity(req, 'Partys', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Party status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await PartysService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Partys', req.params.id, 'DELETE', data);
      await PartysService.delete(req.params.id);
      this.success(res, null, 'Party deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new PartysController();
