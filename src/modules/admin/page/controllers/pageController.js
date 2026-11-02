const { BaseController } = require('../../../../core');
const PageService = require('../services/pageService');

class PageController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 10;
      const data = await PageService.getAll(pageNum, limitNum);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Page fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await PageService.getById(req.params.id);
      if (!data) return this.error(res, 'Page not found', 404);
      this.success(res, data, 'Page fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await PageService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Page', data._id, 'CREATE', req.body);
      this.success(res, data, 'Page created successfully', 201);
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async update(req, res) {
    try {
      const data = await PageService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Page', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Page updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await PageService.status(req.params.id, status);
      //  Log Activities //
      await this.logActivity(req, 'Page', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Page status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await PageService.getById(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Page', req.params.id, 'DELETE', data);
      await PageService.delete(req.params.id);
      this.success(res, null, 'Page deleted successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }
}

module.exports = new PageController();
