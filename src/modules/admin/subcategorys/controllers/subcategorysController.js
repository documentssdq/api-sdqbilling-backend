const { BaseController } = require('../../../../core');
const SubcategorysService = require('../services/subcategorysService');

class SubcategorysController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await SubcategorysService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Subcategorys fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await SubcategorysService.getById(req.params.id);
      if (!data) return this.error(res, 'Subcategorys not found', 404);
      this.success(res, data, 'Subcategorys fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await SubcategorysService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Subcategorys', data._id, 'CREATE', req.body);
      this.success(res, data, 'Subcategory created successfully', 201);
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
      const data = await SubcategorysService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Subcategorys', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Subcategory updated successfully');
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
      const data = await SubcategorysService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'Subcategorys', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Subcategory status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await SubcategorysService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Subcategorys', req.params.id, 'DELETE', data);
      await SubcategorysService.delete(req.params.id);
      this.success(res, null, 'Subcategory deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new SubcategorysController();
