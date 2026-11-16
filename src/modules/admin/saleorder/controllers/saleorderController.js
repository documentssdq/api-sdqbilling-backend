const { BaseController } = require('../../../../core');
const SaleorderService = require('../services/saleorderService');

class SaleorderController extends BaseController {
  async getAll(req, res) {
    try {
      const pageNum = parseInt(req.query.page, 10) || 1;
      const limitNum = parseInt(req.query.limit, 10) || 1000;
      const search = req.query.search || '';
      const finYear = req.query.fin_year || '';
      const data = await SaleorderService.getAll(pageNum, limitNum, search, finYear);
      this.paginated(res, data.data, data.total, pageNum, limitNum, 'Saleorder fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getFinancialYears(req, res) {
    try {
      const years = await SaleorderService.getFinancialYears();
      this.success(res, years, 'Financial years fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getNextNumber(req, res) {
    try {
      const targetDate = req.query.invoice_date || req.query.order_date || req.query.date || new Date();
      const finYear = req.query.fin_year;
      const prefix = req.query.prefix;
      const orderNo = await SaleorderService.getNextSaleorderNo(targetDate, finYear, prefix);
      this.success(res, { sale_order_no: orderNo, sale_no: orderNo }, 'Next sale order number generated successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const data = await SaleorderService.getById(req.params.id);
      if (!data) return this.error(res, 'Sale order not found', 404);
      this.success(res, data, 'Sale order fetched successfully');
    } catch (error) {
      this.error(res, error.message, 500);
    }
  }

  async create(req, res) {
    try {
      const data = await SaleorderService.create(req.body);
      // Log Activities //
      await this.logActivity(req, 'Saleorder', data._id, 'CREATE', req.body);
      this.success(res, data, 'Sale order created successfully', 201);
    } catch (error) {
      this.error(res, error.message, error.statusCode || 400);
    }
  }

  async update(req, res) {
    try {
      const data = await SaleorderService.update(req.params.id, req.body);
      // Log Activities //
      await this.logActivity(req, 'Saleorder', req.params.id, 'UPDATE', req.body);
      this.success(res, data, 'Sale order updated successfully');
    } catch (error) {
      this.error(res, error.message, error.statusCode || 400);
    }
  }

  async status(req, res) {
    try {
      const status = req.body.status === 1 || req.body.status === true;
      const data = await SaleorderService.status(req.params.id, status);
      // Log Activities //
      await this.logActivity(req, 'Saleorder', req.params.id, 'STATUS', req.body);
      this.success(res, data, 'Sale order status updated successfully');
    } catch (error) {
      this.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      const data = await SaleorderService.getById(req.params.id);
      if (!data) {
        return this.error(res, 'Sale order not found', 404);
      }
      await SaleorderService.delete(req.params.id);
      // Log Activities //
      await this.logActivity(req, 'Saleorder', req.params.id, 'DELETE', data);
      this.success(res, null, 'Sale order deleted successfully');
    } catch (error) {
      this.error(res, error.message, error.statusCode || 500);
    }
  }
}

module.exports = new SaleorderController();
